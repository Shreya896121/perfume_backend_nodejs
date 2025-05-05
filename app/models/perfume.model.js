const sql = require("./db.js");
const baseUrl = "http://localhost:8080";

const Perfume = function (perfume) {
  this.title = perfume.title;
  this.description = perfume.description;
  this.published = perfume.published;
  this.image = perfume.image;
  this.label = perfume.label;
  this.category = perfume.category;
  this.size = perfume.size;
};

const fetchBrandsForPerfume = (perfumeId, callback) => {
  sql.query(
    "SELECT b.id, b.title, b.image FROM brands b JOIN perfume_brands pb ON b.id = pb.brand_id WHERE pb.perfume_id = ?",
    [perfumeId],
    (err, res) => {
      if (err) {
        console.log("Error fetching brands: ", err);
        callback(err, null);
        return;
      }
      callback(
        null,
        res.map((brand) => ({
          id: brand.id,
          title: brand.title,
          image: brand.image,
        }))
      );
    }
  );
};

const enrichPerfumesWithBrands = (perfumes, callback) => {
  const enrichedPerfumes = [];
  let completed = 0;

  if (!perfumes || perfumes.length === 0) {
    callback(null, []);
    return;
  }

  perfumes.forEach((perfume, index) => {
    fetchBrandsForPerfume(perfume.id, (err, brands) => {
      if (err) {
        callback(err, null);
        return;
      }
      enrichedPerfumes[index] = {
        ...perfume,
        imageUrl: `${baseUrl}/images/${perfume.image}`,
        brands: brands.length > 0 ? brands : [],
      };
      completed++;
      if (completed === perfumes.length) {
        callback(
          null,
          enrichedPerfumes.sort((a, b) => a.id - b.id)
        );
      }
    });
  });
};

Perfume.create = (newPerfume, result) => {
  sql.query("INSERT INTO perfumes SET ?", newPerfume, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created perfume: ", { id: res.insertId, ...newPerfume });
    result(null, { id: res.insertId, ...newPerfume });
  });
};

Perfume.findById = (id, result) => {
  sql.query(
    `
    SELECT 
      p.*,
      AVG(COALESCE(r.stars, 0)) as average_rating,
      COUNT(r.id) as review_count,
      MAX(CASE WHEN n.note_type = 'top_note' THEN n.icon END) AS top_note_icon,
      MAX(CASE WHEN n.note_type = 'middle_note' THEN n.icon END) AS middle_note_icon,
      MAX(CASE WHEN n.note_type = 'low_note' THEN n.icon END) AS base_note_icon
    FROM perfumes p
    LEFT JOIN reviews r ON p.id = r.perfume_id
    LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
    LEFT JOIN notes n ON pn.note_id = n.id
    WHERE p.id = ?
    GROUP BY p.id, p.title, p.image, p.description, p.size  -- Include all perfume columns
  `,
    [id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.length) {
        sql.query(
          `
        SELECT stars
        FROM reviews
        WHERE perfume_id = ?
        ORDER BY stars
      `,
          [id],
          (err2, ratingsRes) => {
            if (err2) {
              console.log("error fetching ratings: ", err2);
              result(err2, null);
              return;
            }

            fetchBrandsForPerfume(id, (err3, brands) => {
              if (err3) {
                result(err3, null);
                return;
              }

              const ratingsArray = ratingsRes.map((row) =>
                parseFloat(row.stars.toFixed(1))
              );

              const perfumeWithImage = {
                ...res[0],
                imageUrl: `${baseUrl}/images/${res[0].image}`,
                brands: brands,
                notes: {
                  top: res[0].top_note_icon
                    ? `${baseUrl}/images/${res[0].top_note_icon}`
                    : null,
                  middle: res[0].middle_note_icon
                    ? `${baseUrl}/images/${res[0].middle_note_icon}`
                    : null,
                  base: res[0].base_note_icon
                    ? `${baseUrl}/images/${res[0].base_note_icon}`
                    : null,
                },
                averageRating: parseFloat(res[0].average_rating.toFixed(1)),
                reviewCount: res[0].review_count,
                ratings: ratingsArray.length > 0 ? ratingsArray : [],
              };

              perfumeWithImage.averageRating = Math.max(
                1.0,
                Math.min(5.0, perfumeWithImage.averageRating)
              );

              console.log("found perfume: ", perfumeWithImage);
              result(null, perfumeWithImage);
            });
          }
        );
      } else {
        result({ kind: "not_found" }, null);
      }
    }
  );
};

Perfume.getAll = (title, result) => {
  let query = "SELECT * FROM perfumes";
  let params = [];

  if (title) {
    query += " WHERE title LIKE ?";
    params.push(`%${title}%`);
  }

  sql.query(query, params, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    enrichPerfumesWithBrands(res, (err, enrichedPerfumes) => {
      if (err) {
        result(err, null);
        return;
      }

      // Serve images from the "images" folder
      const baseURL = "http://localhost:8080/images/";
      enrichedPerfumes.forEach((perfume) => {
        perfume.image = perfume.image
          ? `${baseURL}${perfume.image}`
          : `${baseURL}default-image.jpg`;
        perfume.image_name = perfume.image.split("/").pop();
      });

      console.log("perfumes: ", enrichedPerfumes);
      result(null, enrichedPerfumes);
    });
  });
};

Perfume.searchPerfumes = (searchTerm, result) => {
  let query = "SELECT * FROM perfumes WHERE title LIKE ? OR description LIKE ?";
  let params = [`%${searchTerm}%`, `%${searchTerm}%`];

  sql.query(query, params, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    enrichPerfumesWithBrands(res, (err, enrichedPerfumes) => {
      if (err) {
        result(err, null);
        return;
      }
      console.log("perfumes: ", enrichedPerfumes);
      result(null, enrichedPerfumes);
    });
  });
};

Perfume.getMostOrdered = (result) => {
  // Check if result is a function
  if (typeof result !== "function") {
    console.error("Error: No callback function provided to getMostOrdered");
    return;
  }

  sql.query(
    `
    SELECT p.*, COUNT(po.perfume_id) as order_count
    FROM perfumes p
    LEFT JOIN perfume_orders po ON p.id = po.perfume_id
    GROUP BY p.id 
    ORDER BY order_count DESC
    LIMIT 4
  `,
    (err, res) => {
      // NOTE: REMOVE LIMIT IF U WANNA SHOW MORE IN FRONTEND
      if (err) {
        console.log("Query error: ", err);
        result(null, err);
        return;
      }

      console.log("Query results: ", res);

      enrichPerfumesWithBrands(res, (err, enrichedPerfumes) => {
        if (err) {
          console.log("Enrichment error: ", err);
          result(err, null); // Fixed 'nil' to 'null'
          return;
        }

        console.log("most ordered perfumes: ", enrichedPerfumes);
        result(null, enrichedPerfumes);
      });
    }
  );
};

Perfume.findByBrand = (brand, result) => {
  sql.query(
    "SELECT p.* FROM perfumes p JOIN perfume_brands pb ON p.id = pb.perfume_id JOIN brands b ON pb.brand_id = b.id WHERE b.title = ?",
    [brand],
    (err, res) => {
      if (err) {
        console.log("Error: ", err);
        result(err, null);
        return;
      }
      if (res.length) {
        enrichPerfumesWithBrands(res, (err, enrichedPerfumes) => {
          if (err) {
            result(err, null);
            return;
          }
          console.log("Found perfumes: ", enrichedPerfumes);
          result(null, enrichedPerfumes);
        });
      } else {
        result({ kind: "not_found" }, null);
      }
    }
  );
};

Perfume.findByLabel = (label, result) => {
  sql.query("SELECT * FROM perfumes WHERE label = ?", [label], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      enrichPerfumesWithBrands(res, (err, enrichedPerfumes) => {
        if (err) {
          result(err, null);
          return;
        }
        console.log("Found perfumes: ", enrichedPerfumes);
        result(null, enrichedPerfumes);
      });
    } else {
      result({ kind: "not_found" }, null);
    }
  });
};

Perfume.findByCategory = (category, result) => {
  sql.query(
    "SELECT * FROM perfumes WHERE category = ?",
    [category],
    (err, res) => {
      if (err) {
        console.log("Error: ", err);
        result(err, null);
        return;
      }
      if (res.length) {
        enrichPerfumesWithBrands(res, (err, enrichedPerfumes) => {
          if (err) {
            result(err, null);
            return;
          }
          console.log("Found perfumes: ", enrichedPerfumes);
          result(null, enrichedPerfumes);
        });
      } else {
        result({ kind: "not_found" }, null);
      }
    }
  );
};

Perfume.updateById = (id, perfume, result) => {
  sql.query(
    "UPDATE perfumes SET title = ?, description = ?, published = ?, image = ?, category = ?, label = ?, size = ? WHERE id = ?",
    [
      perfume.title,
      perfume.description,
      perfume.published,
      perfume.image,
      perfume.category,
      perfume.label,
      perfume.size,
      id,
    ],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("updated perfume: ", { id: id, ...perfume });
      result(null, { id: id, ...perfume });
    }
  );
};

Perfume.remove = (id, result) => {
  sql.query("DELETE FROM perfumes WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }
    console.log("deleted perfume with id: ", id);
    result(null, res);
  });
};

Perfume.removeAll = (result) => {
  sql.query("DELETE FROM perfumes", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`deleted ${res.affectedRows} perfumes`);
    result(null, res);
  });
};

module.exports = Perfume;

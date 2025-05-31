const sql = require("./db.js");
const baseUrl = "http://localhost:8080";

const Brand = function (brand) {
  this.title = brand.title;
  this.image = brand.image;
};

// Create a new Brand
Brand.create = (newBrand, result) => {
  sql.query("INSERT INTO brands SET ?", newBrand, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("Created brand: ", { id: res.insertId, ...newBrand });
    result(null, { id: res.insertId, ...newBrand });
  });
};

// Find a Brand by ID
Brand.findById = (id, result) => {
  sql.query(
    "SELECT b.id AS brand_id, b.title AS brand_name, b.image, p.size, p.id AS perfume_id, p.image AS product_image, p.title AS perfume_name, p.description " +
    "FROM brands b " +
    "LEFT JOIN perfume_brands pb ON b.id = pb.brand_id " +
    "LEFT JOIN perfumes p ON pb.perfume_id = p.id " +
    "WHERE b.id = ?",
    [id],
    (err, res) => {
      if (err) {
        console.log("Error: ", err);
        result(err, null);
        return;
      }

      if (res.length) {
        // Filter out rows where perfume_id is null (no associated perfumes)
        const perfumeRows = res.filter(row => row.perfume_id !== null);

        // Extract brand info from the first row
        const brandData = {
          title: res[0].brand_name,
          perfumes: perfumeRows.length > 0 
            ? perfumeRows.map(row => ({
                id: row.perfume_id,
                title: row.perfume_name,
                description: row.description,
                imageUrl: `${baseUrl}/images/${row.product_image}`,
                size: row.size ?? []
              }))
            : [], // Empty array if no perfumes
          imageUrl: `${baseUrl}/images/${res[0].image}`
        };

        console.log("Found brand with perfumes: ", brandData);
        result(null, brandData);
        return;
      }

      result({ kind: "not_found" }, null);
    }
  );
};

// Get all Brands
Brand.getAll = (result) => {
  sql.query("SELECT * FROM brands", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    const brandsWithImageUrl = res.map((brand) => ({
      ...brand,
      imageUrl: `${baseUrl}/images/${brand.image}`, // Add imageUrl
    }));
    console.log("brands: ", brandsWithImageUrl);
    result(null, brandsWithImageUrl);
  });
};

// Find a Brand by Name
Brand.findByName = (title, result) => {
  sql.query("SELECT * FROM brands WHERE title LIKE ?", [`%${title}%`], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      const brandsWithImages = res.map((brand) => ({
        ...brand,
        imageUrl: `${baseUrl}/images/${brand.image}`,
      }));

      console.log("Found brands: ", brandsWithImages);
      result(null, brandsWithImages);
      return;
    }

    result({ kind: "not_found" }, null);
  });
};

// Update a Brand by ID
Brand.updateById = (id, brand, result) => {
  sql.query(
    "UPDATE brands SET title = ?, image = ? WHERE id = ?",
    [brand.title, brand.image, id],
    (err, res) => {
      if (err) {
        console.log("Error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      const updatedBrand = {
        id: id,
        ...perfume,
        imageUrl: `${baseUrl}/images/${brand.image}`,
      };
      console.log("Updated brand: ", { id, ...brand });
      result(null, { id, ...brand });
    }
  );
};

// Delete a Brand by ID
Brand.remove = (id, result) => {
  sql.query("DELETE FROM brands WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("Deleted brand with id: ", id);
    result(null, res);
  });
};

// Delete All Brands
Brand.removeAll = (result) => {
  sql.query("DELETE FROM brands", (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(null, err);
      return;
    }

    console.log(`Deleted ${res.affectedRows} brands`);
    result(null, res);
  });
};

module.exports = Brand;

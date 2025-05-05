const Perfume = require("../models/perfume.model.js");

// Helper function to manage perfume_brands table
const managePerfumeBrands = (perfumeId, brandId, action, callback) => {
  const sql = require("../models/db.js");

  if (action === "create" || action === "update") {
    sql.query(
      "DELETE FROM perfume_brands WHERE perfume_id = ?",
      [perfumeId],
      (err) => {
        if (err) return callback(err);
        sql.query(
          "INSERT INTO perfume_brands (perfume_id, brand_id) VALUES (?, ?)",
          [perfumeId, brandId],
          (err, res) => {
            callback(err, res);
          }
        );
      }
    );
  } else if (action === "delete") {
    sql.query(
      "DELETE FROM perfume_brands WHERE perfume_id = ?",
      [perfumeId],
      (err, res) => {
        callback(err, res);
      }
    );
  }
};

// Create and Save a new Perfume
exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  const sizeString = JSON.stringify(req.body.size || []);
  const perfume = new Perfume({
    title: req.body.title,
    description: req.body.description,
    published: req.body.published || false,
    image: req.body.image,
    label: req.body.label,
    category: req.body.category,
    size: sizeString,
  });

  Perfume.create(perfume, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Perfume.",
      });
    } else {
      if (req.body.brand && req.body.brand.id) {
        managePerfumeBrands(data.id, req.body.brand.id, "create", (err) => {
          if (err) {
            res.status(500).send({
              message: "Error linking brand to perfume.",
            });
          } else {
            res.send({ ...data, brand: req.body.brand });
          }
        });
      } else {
        res.send(data);
      }
    }
  });
};

exports.findAll = (req, res) => {
  const title = req.query.title;

  Perfume.getAll(title, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving perfumes.",
      });
    else res.send(data); 
  });
};

exports.search = (req, res) => {
  const searchTerm = req.query.term;

  Perfume.searchPerfumes(searchTerm, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while searching perfumes.",
      });
    else res.send(data); // Now includes brands
  });
};

exports.mostorder = (req, res) => {
  Perfume.getMostOrdered((err, data) => {
    if (err) {
      console.error("Error fetching most ordered perfumes:", err);
      return res.status(500).json({
        message: "Error retrieving most ordered perfumes",
        error: err.message
      });
    }
    res.status(200).json(data);
  });
};

// Find a single Perfume by Id
exports.findOne = (req, res) => {
  Perfume.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Perfume with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Perfume with id " + req.params.id,
        });
      }
    } else res.send(data); // Now includes brands
  });
};

// Find all published Perfumes
exports.findAllPublished = (req, res) => {
  Perfume.getAllPublished((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving perfumes.",
      });
    else res.send(data); // Now includes brands
  });
};

// Find perfumes by label
exports.findByLabel = (req, res) => {
  const label = req.params.label;

  Perfume.findByLabel(label, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No perfumes found with label ${label}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving perfumes with label " + label,
        });
      }
    } else res.send(data); // Now includes brands
  });
};

// Find perfumes by brand
exports.findByBrand = (req, res) => {
  const brand = req.params.brand;

  Perfume.findByBrand(brand, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No perfumes found with brand ${brand}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving perfumes with brand " + brand,
        });
      }
    } else res.send(data); // Now includes brands
  });
};

// Find perfumes by category
exports.findByCategory = (req, res) => {
  const category = req.params.category;

  Perfume.findByCategory(category, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No perfumes found with category ${category}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving perfumes with category " + category,
        });
      }
    } else res.send(data); // Now includes brands
  });
};

// Update a Perfume identified by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  console.log(req.body);

  const sizeString = JSON.stringify(req.body.size || []);
  const perfume = new Perfume({
    title: req.body.title,
    description: req.body.description,
    published: req.body.published,
    image: req.body.image,
    label: req.body.label,
    category: req.body.category,
    size: sizeString,
  });

  Perfume.updateById(req.params.id, perfume, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Perfume with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error updating Perfume with id " + req.params.id,
        });
      }
    } else {
      if (req.body.brand && req.body.brand.id) {
        managePerfumeBrands(
          req.params.id,
          req.body.brand.id,
          "update",
          (err) => {
            if (err) {
              res.status(500).send({
                message: "Error updating brand association for perfume.",
              });
            } else {
              res.send({ ...data, brand: req.body.brand });
            }
          }
        );
      } else {
        res.send(data);
      }
    }
  });
};

// Delete a Perfume with the specified id in the request
exports.delete = (req, res) => {
  Perfume.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Perfume with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete Perfume with id " + req.params.id,
        });
      }
    } else {
      managePerfumeBrands(req.params.id, null, "delete", (err) => {
        if (err) {
          res.status(500).send({
            message: "Error deleting brand associations for perfume.",
          });
        } else {
          res.send({ message: `Perfume was deleted successfully!` });
        }
      });
    }
  });
};

// Delete all Perfumes from the database.
exports.deleteAll = (req, res) => {
  Perfume.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all perfumes.",
      });
    else {
      const sql = require("../models/db.js");
      sql.query("DELETE FROM perfume_brands", (err, res) => {
        if (err) {
          res.status(500).send({
            message: "Error deleting all brand associations.",
          });
        } else {
          res.send({ message: `All Perfumes were deleted successfully!` });
        }
      });
    }
  });
};

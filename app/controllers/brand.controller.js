const Brand = require("../models/brand.model.js");

exports.create = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  const brand = new Brand({
    title: req.body.title,
    image: req.body.image,
  });

  Brand.create(brand, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Brand.",
      });
    else res.send(data);
  });
};

exports.findAll = (req, res) => {
  Brand.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving brands.",
      });
    else res.send(data);
  });
};

exports.findOne = (req, res) => {
  Brand.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Brand with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Brand with id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};


exports.update = (req, res) => {

  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  Brand.updateById(req.params.id, new Brand(req.body), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Brand with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error updating Brand with id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};

exports.delete = (req, res) => {
  Brand.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Brand with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete Brand with id " + req.params.id,
        });
      }
    } else res.send({ message: `Brand was deleted successfully!` });
  });
};

exports.deleteAll = (req, res) => {
  Brand.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all brands.",
      });
    else res.send({ message: `All Brands were deleted successfully!` });
  });
};

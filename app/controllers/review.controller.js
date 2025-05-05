const Review = require("../models/review.model.js");

// Create and Save a new Review
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  // Create a Review
  const review = new Review({
    perfume_id: req.body.perfume_id,
    user_id: req.body.user_id,
    review_text: req.body.review_text,
    stars: req.body.stars,
    photo: req.body.photo,
  });

  // Save Review in the database
  Review.create(review, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Review.",
      });
    else res.send(data);
  });
};

// Retrieve all Reviews from the database
exports.findAll = (req, res) => {
  Review.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving reviews.",
      });
    else res.send(data);
  });
};

// Find a single Review by Id
exports.findOne = (req, res) => {
  Review.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Review with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Review with id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};

// Find all Reviews by Perfume Id
exports.findByPerfumeId = (req, res) => {
  const perfumeId = req.params.perfumeId;

  Review.findByPerfumeId(perfumeId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No reviews found for perfume with id ${perfumeId}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving reviews for perfume with id " + perfumeId,
        });
      }
    } else res.send(data);
  });
};

// Find all Reviews by User Id
exports.findByUserId = (req, res) => {
  const userId = req.params.userId;

  Review.findByUserId(userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No reviews found for user with id ${userId}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving reviews for user with id " + userId,
        });
      }
    } else res.send(data);
  });
};

exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  Review.updateById(req.params.id, new Review(req.body), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Review with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error updating Review with id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};

// Delete a Review with the specified id in the request
exports.delete = (req, res) => {
  Review.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Review with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete Review with id " + req.params.id,
        });
      }
    } else res.send({ message: `Review was deleted successfully!` });
  });
};

// Delete all Reviews from the database
exports.deleteAll = (req, res) => {
  Review.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while removing all reviews.",
      });
    else res.send({ message: `All Reviews were deleted successfully!` });
  });
};
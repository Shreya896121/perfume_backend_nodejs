const sql = require("./db.js");

// Constructor
const Review = function (review) {
  this.perfume_id = review.perfume_id;
  this.user_id = review.user_id;
  this.review_text = review.review_text;
  this.stars = review.stars;
  this.photo = review.photo;
};

// Create a new Review
Review.create = (newReview, result) => {
  sql.query("INSERT INTO reviews SET ?", newReview, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created review: ", { id: res.insertId, ...newReview });
    result(null, { id: res.insertId, ...newReview });
  });
};

// Find a Review by ID
Review.findById = (id, result) => {
  sql.query(`SELECT * FROM reviews WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found review: ", res[0]);
      result(null, res[0]);
      return;
    }

    // Not found Review with the id
    result({ kind: "not_found" }, null);
  });
};

// Retrieve all Reviews
Review.getAll = (result) => {
  sql.query(
    "SELECT *, perfumes.title AS perfume_name, users.name AS user_name, reviews.id AS id FROM reviews LEFT JOIN users ON reviews.user_id = users.id LEFT JOIN perfumes ON reviews.perfume_id = perfumes.id",
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      console.log("reviews: ", res);
      result(null, res);
    }
  );
};
//comment
Review.findByPerfumeId = (perfumeId, result) => {
  sql.query(
    `SELECT *,users.name AS user_name FROM reviews INNER JOIN users ON reviews.user_id = users.id WHERE perfume_id = ${perfumeId}`,
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      console.log("reviews: ", res);
      result(null, res);
    }
  );
};

Review.findByUserId = (userId, result) => {
  sql.query(`SELECT * FROM reviews WHERE user_id = ${userId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("reviews: ", res);
    result(null, res);
  });
};

// Update a Review by ID
Review.updateById = (id, review, result) => {
  sql.query(
    "UPDATE reviews SET perfume_id = ?, user_id = ?, review_text = ?, stars = ?, photo = ? WHERE id = ?",
    [
      review.perfume_id,
      review.user_id,
      review.review_text,
      review.stars,
      review.photo,
      id,
    ],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // Not found Review with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated review: ", { id: id, ...review });
      result(null, { id: id, ...review });
    }
  );
};

// Delete a Review by ID
Review.remove = (id, result) => {
  sql.query("DELETE FROM reviews WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted review with id: ", id);
    result(null, res);
  });
};

Review.removeAll = (result) => {
  sql.query("DELETE FROM reviews", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} reviews`);
    result(null, res);
  });
};

module.exports = Review;

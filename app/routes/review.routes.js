module.exports = (app) => {
  const reviews = require("../controllers/review.controller.js");

  var router = require("express").Router();

  router.post("/", reviews.create);

  router.get("/", reviews.findAll);

  router.get("/:id", reviews.findOne);

  router.get("/perfume/:perfumeId", reviews.findByPerfumeId);

  router.get("/user/:userId", reviews.findByUserId);

  router.put("/:id", reviews.update);

  router.delete("/:id", reviews.delete);

  router.delete("/", reviews.deleteAll);

  app.use("/api/reviews", router);
};
module.exports = (app) => {
  const perfumes = require("../controllers/perfume.controller.js");
  var router = require("express").Router();

  router.post("/", perfumes.create);
  router.get("/", perfumes.findAll);
  router.get("/search", perfumes.search);
  router.get("/mostorder", perfumes.mostorder);
  router.get("/published", perfumes.findAllPublished);
  router.get("/:id", perfumes.findOne);
  router.get("/label/:label", perfumes.findByLabel);
  router.get("/brand/:brand", perfumes.findByBrand);
  router.get("/category/:category", perfumes.findByCategory);
  router.delete("/:id", perfumes.delete);
  router.delete("/", perfumes.deleteAll);
  router.put("/:id", perfumes.update);
  app.use("/api/perfumes", router);
};

module.exports = (app) => {
  const notes = require("../controllers/note.controller.js");

  var router = require("express").Router();

  router.post("/", notes.create);

  router.get("/", notes.findAll);

  router.get("/:id", notes.findOne);

  router.put("/:id", notes.update);

  router.delete("/:id", notes.delete);

  router.delete("/", notes.deleteAll);

  app.use("/api/notes", router);
};

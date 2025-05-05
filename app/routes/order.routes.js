module.exports = (app) => {
    const orders = require("../controllers/order.controller.js");
    var router = require("express").Router();

    router.post("/", orders.create);
 
    router.get("/", orders.findAll);

router.get("/user/:userId", orders.findByUserId);

    router.get("/:id", orders.findOne);
 
    router.patch("/:id", orders.update);

    router.patch("/status/:id", orders.updateStatus);


    router.delete("/:id", orders.delete);

    router.delete("/", orders.deleteAll);
 
    app.use("/api/orders", router);
  };
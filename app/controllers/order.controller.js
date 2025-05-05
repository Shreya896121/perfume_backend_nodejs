const Order = require("../models/order.model.js");

// Create and Save a new Order
exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content cannot be empty!",
    });
  }

  const order = new Order({
    Order_id: req.body.Order_id,
    Payment_status: req.body.Payment_status,
    Status: req.body.Status || "pending",
    Price: req.body.Price,
    User_id: req.body.User_id,
    cart: req.body.cart,
  });

  Order.create(order, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Order.",
      });
    } else {
      res.send(data);
    }
  });
};

// Retrieve all Orders from the database
exports.findAll = (req, res) => {
  Order.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving orders.",
      });
    } else {
      res.send(data);
    }
  });
};

// Find a single Order by ID
exports.findOne = (req, res) => {
  Order.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Order with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Order with id " + req.params.id,
        });
      }
    } else {
      res.send(data);
    }
  });
};

// Update an Order by ID
exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content cannot be empty!",
    });
  }

  const order = new Order({
    Order_id: req.body.Order_id,
    Payment_status: req.body.Payment_status,
    Status: req.body.Status,
    Price: req.body.Price,
    User_id: req.body.User_id,
    cart: req.body.cart, // Cart is already an array of objects
  });

  Order.updateById(req.params.id, order, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Order with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error updating Order with id " + req.params.id,
        });
      }
    } else {
      res.send(data);
    }
  });
};

exports.updateStatus = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content cannot be empty!",
    });
  }

  const order = new Order({
    Status: req.body.Status,
  });

  Order.updateStatus(req.params.id, order, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Order with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error updating Order with id " + req.params.id,
        });
      }
    } else {
      res.send(data);
    }
  });
};

// Delete an Order by ID
exports.delete = (req, res) => {
  Order.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Order with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete Order with id " + req.params.id,
        });
      }
    } else {
      res.send({ message: `Order was deleted successfully!` });
    }
  });
};

// order.controller.js

// Add this function to the exports
exports.findByUserId = (req, res) => {
  const userId = req.params.userId;

  Order.findByUserId(userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No orders found for user with id ${userId}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving orders for user with id " + userId,
        });
      }
    } else {
      res.send(data);
    }
  });
};

// Delete all Orders
exports.deleteAll = (req, res) => {
  Order.removeAll((err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all orders.",
      });
    } else {
      res.send({ message: `All Orders were deleted successfully!` });
    }
  });
};

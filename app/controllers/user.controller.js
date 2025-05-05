console.log("user.controller.js");
const User = require("../models/user.model.js");

// Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  // Create a User
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    dob: req.body.dob,
    gender: req.body.gender,
    role: req.body.role || "user", // Default role to "user" if not provided
    phone: req.body.phone
  });

  // Save User in the database
  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User.",
      });
    else res.send(data);
  });
};

exports.login = (req, res) => {
    // Validate request
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({
        message: "Email and password are required!",
      });
    }
  
    User.findByEmail(req.body.email, (err, user) => {
      if (err) {
        if (err.kind === "not_found") {
          return res.status(404).send({
            message: `No user found with email ${req.body.email}.`,
          });
        }
        return res.status(500).send({
          message: "Error retrieving user with email " + req.body.email,
        });
      }
  
      // Check password (plain text comparison for demo; use hashing in production)
      if (user.password !== req.body.password) {
        return res.status(401).send({
          message: "Invalid password!",
        });
      }
  
      // Success: Return user data (excluding password for security)
      const { password, ...userWithoutPassword } = user;
      res.send({
        message: "Login successful!",
        user: userWithoutPassword,
      });
    });
  };
// Retrieve all Users from the database (with condition).
exports.findAll = (req, res) => {
  const name = req.query.name;

  User.getAll(name, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    else res.send(data);
  });
};

exports.getDashboardStats = (req, res) => {
  User.getStats((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving dashboard stats.",
      });
    } else {
      res.send(data);
    }
  });
};

exports.findOne = (req, res) => {
  User.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving User with id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};

exports.findByRole = (req, res) => {
  const role = req.params.role; 

  User.findByRole(role, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No users found with role ${role}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving users with role " + role,
        });
      }
    } else res.send(data);
  });
};

exports.findByGender = (req, res) => {
  const gender = req.params.gender; 

  User.findByGender(gender, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No users found with gender ${gender}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving users with gender " + gender,
        });
      }
    } else res.send(data);
  });
};


exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  console.log(req.body);

  User.updateById(req.params.id, new User(req.body), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error updating User with id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};

exports.delete = (req, res) => {
  User.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete User with id " + req.params.id,
        });
      }
    } else res.send({ message: `User was deleted successfully!` });
  });
};

exports.deleteAll = (req, res) => {
  User.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while removing all users.",
      });
    else res.send({ message: `All Users were deleted successfully!` });
  });
};

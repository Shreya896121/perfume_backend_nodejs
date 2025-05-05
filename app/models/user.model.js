console.log("user.model.js");
const sql = require("./db.js");
const baseUrl = "http://localhost:8080";

// Constructor
const User = function (user) {
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
  this.dob = user.dob;
  this.gender = user.gender;
  this.role = user.role;
  this.phone = user.phone;
};

User.create = (newUser, result) => {
  sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created user: ", { id: res.insertId, ...newUser });
    result(null, { id: res.insertId, ...newUser });
  });
};

User.findById = (id, result) => {
  sql.query(`SELECT * FROM users WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found user: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found User with the id
    result({ kind: "not_found" }, null);
  });
};

User.getAll = (name, result) => {
  let query = "SELECT * FROM users";

  if (name) {
    query += ` WHERE name LIKE '%${name}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("users: ", res);
    result(null, res);
  });
};

User.getStats = (result) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM perfumes) as perfumeCount,
      (SELECT COUNT(*) FROM orders) as orderCount,
      (SELECT COUNT(*) FROM reviews) as reviewCount,
      (SELECT COUNT(*) FROM users WHERE role = 'user') as userCount
  `;

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("dashboard stats: ", res[0]);
    result(null, res[0]); // Return the first row since it's a single result
  });
};

User.findByRole = (role, result) => {
  sql.query("SELECT * FROM users WHERE role = ?", [role], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("Found users: ", res);
      result(null, res);
      return;
    }

    result({ kind: "not_found" }, null);
  });
};

User.findByGender = (gender, result) => {
  sql.query("SELECT * FROM users WHERE gender = ?", [gender], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("Found users: ", res);
      result(null, res);
      return;
    }

    result({ kind: "not_found" }, null);
  });
};

User.updateById = (id, user, result) => {
  sql.query(
    "UPDATE users SET name = ?, email = ?, password = ?, dob = ?, gender = ?, role = ?, phone = ? WHERE id = ?",
    [
      user.name,
      user.email,
      user.password,
      user.dob,
      user.gender,
      user.role,
      user.phone,
      id,
    ],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found User with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated user: ", { id: id, ...user });
      result(null, { id: id, ...user });
    }
  );
};

User.remove = (id, result) => {
  sql.query("DELETE FROM users WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found User with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted user with id: ", id);
    result(null, res);
  });
};

User.removeAll = (result) => {
  sql.query("DELETE FROM users", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} users`);
    result(null, res);
  });
};

User.findByEmail = (email, result) => {
  sql.query("SELECT * FROM users WHERE email = ?", [email], (err, res) => {
    if (err) {
      console.log("Error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("Found user: ", res[0]);
      result(null, res[0]);
      return;
    }

    result({ kind: "not_found" }, null);
  });
};

module.exports = User;

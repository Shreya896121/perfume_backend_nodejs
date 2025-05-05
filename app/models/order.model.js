const sql = require("./db.js");
const baseUrl = "http://localhost:8080";

const Order = function (order) {
  this.Order_id = order.Order_id;
  this.Payment_status = order.Payment_status;
  this.Status = order.Status;
  this.Price = order.Price;
  this.User_id = order.User_id;
  this.cart = JSON.stringify(order.cart); 
};

Order.create = (newOrder, result) => {
  sql.query("INSERT INTO Orders SET ?", newOrder, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    const cartItems = JSON.parse(newOrder.cart);
    if (cartItems && cartItems.length > 0) {
      const perfumeOrders = cartItems.map((item) => ({
        Perfume_id: item.id,
        order_id: newOrder.Order_id,
      }));

      sql.query(
        "INSERT INTO Perfume_orders (Perfume_id, order_id) VALUES ?",
        [perfumeOrders.map((po) => [po.Perfume_id, po.order_id])],
        (err, res) => {
          if (err) {
            console.log("error inserting into Perfume_orders: ", err);
            result(err, null);
            return;
          }
          console.log("created perfume_orders: ", res);
        }
      );
    }

    result(null, { id: res.insertId, ...newOrder });
  });
};

Order.findByUserId = (userId, result) => {
    sql.query("SELECT * FROM Orders WHERE User_id = ?", [userId], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.length) {
        const orders = res.map((order) => ({
          ...order,
          cart: JSON.parse(order.cart), // Parse cart JSON string
        }));
        console.log("found orders: ", orders);
        result(null, orders);
      } else {
        result({ kind: "not_found" }, null);
      }
    });
  };
  
Order.findById = (id, result) => {
  sql.query("SELECT * FROM Orders WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      const order = {
        ...res[0],
        cart: JSON.parse(res[0].cart), // Parse cart JSON string
      };
      console.log("found order: ", order);
      result(null, order);
    } else {
      result({ kind: "not_found" }, null);
    }
  });
};

// Get all orders
Order.getAll = (result) => {
  sql.query("SELECT *, Orders.id as order_pid FROM Orders LEFT JOIN users ON users.id = Orders.user_id", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    const orders = res.map((order) => ({
      ...order,
      cart: JSON.parse(order.cart), // Parse cart JSON string
    }));
    console.log("orders: ", orders);
    result(null, orders);
  });
};

// Update an order by ID
Order.updateById = (id, order, result) => {
  sql.query(
    "UPDATE Orders SET Order_id = ?, Payment_status = ?, Status = ?, Price = ?, User_id = ?, cart = ? WHERE id = ?",
    [
      order.Order_id,
      order.Payment_status,
      order.Status,
      order.Price,
      order.User_id,
      JSON.stringify(order.cart), // Convert cart to JSON string
      id,
    ],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("updated order: ", { id: id, ...order });
      result(null, { id: id, ...order });
    }
  );
};

Order.updateStatus = (id, order, result) => {
  sql.query(
    "UPDATE Orders SET Status = ? WHERE id = ?",
    [order.Status, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      // Fetch the updated order data
      sql.query(
        "SELECT * FROM Orders WHERE id = ?",
        [id],
        (fetchErr, fetchRes) => {
          if (fetchErr) {
            console.log("fetch error: ", fetchErr);
            result(null, fetchErr);
            return;
          }
          if (fetchRes.length === 0) {
            result({ kind: "not_found_after_update" }, null);
            return;
          }

          const updatedOrder = fetchRes[0];
          console.log("updated order here: ", updatedOrder);

          // Check if status is "completed" and update stock
          if (updatedOrder.Status === "completed") {
            try {
              const cartItems = JSON.parse(updatedOrder.cart);
              
              // Process each item in the cart
              cartItems.forEach((item) => {
                sql.query(
                  "UPDATE perfumes SET stock = stock - ? WHERE id = ?",
                  [item.quantity, item.id],
                  (stockErr, stockRes) => {
                    if (stockErr) {
                      console.log(`Error updating stock for perfume ${item.id}: `, stockErr);
                      // Note: We're not returning error to client here to continue processing other items
                    } else if (stockRes.affectedRows === 0) {
                      console.log(`Perfume with id ${item.id} not found for stock update`);
                    } else {
                      console.log(`Updated stock for perfume ${item.id}, subtracted ${item.quantity}`);
                    }
                  }
                );
              });
            } catch (parseError) {
              console.log("Error parsing cart JSON: ", parseError);
            }
          }

          result(null, updatedOrder);
        }
      );
    }
  );
};

// Delete an order by ID
Order.remove = (id, result) => {
  sql.query("DELETE FROM Orders WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }
    console.log("deleted order with id: ", id);
    result(null, res);
  });
};

// Delete all orders
Order.removeAll = (result) => {
  sql.query("DELETE FROM Orders", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`deleted ${res.affectedRows} orders`);
    result(null, res);
  });
};

module.exports = Order;
const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");

const app = express();

const path = require("path");
app.use(express.static("public"));
app.use("/images", express.static("images"));

var corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:8081"], 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, 
};

app.use(cors(corsOptions));

app.use(express.json()); 

app.use(
  express.urlencoded({ extended: true })
); 


app.get("/", (req, res) => {
  res.json({ message: "Welcome to Essence application backend." });
});
require("./app/routes/perfume.routes.js")(app);
require("./app/routes/user.routes.js")(app);
require("./app/routes/note.routes.js")(app);
require("./app/routes/review.routes.js")(app);
require("./app/routes/brand.routes.js")(app);
require("./app/routes/order.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

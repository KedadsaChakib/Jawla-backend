const express = require("express");

const utilisateurController = require("./Controllers/utilisateurController");
const responsableController = require("./Controllers/responsableController");
const lieuController = require("./Controllers/lieuController");
const employeController = require("./Controllers/employeController");

const pool = require("./database.js");

const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.send("Jawla Backend");
});

app.use("/utilisateur", utilisateurController);
app.use("/responsable", responsableController);
app.use("/employe", employeController);
app.use("/lieu",lieuController);

app.listen(4000, () => {
  console.log("Server started on port 4000");
});

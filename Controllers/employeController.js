express = require("express");
const employeService = require("../Services/employeService.js");

const employeController = express.Router();

employeController.get("/AfficherDemandes", async (req, res, next) => {
  try {
    const result = await employeService.AfficherDemandes();
    res.status(200).send(result);
    next();
  } catch (e) {
    res.status(500).send(e.message);
  }
});

employeController.post("/AccepterDemande/:idPI", async (req, res, next) => {
  try {
    await employeService.AccepterDemande(req.params.idPI);
    res.status(200).send("Demande acceptée avec succés");
    next();
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
});

employeController.get("/AfficherStatsGlobales", async (req, res, next) => {
  try {
    const result = await employeService.AfficherStatsGlobales();
    res.status(200).send(result);
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
});


module.exports = employeController;

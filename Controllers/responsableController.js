express = require("express");
const responsableService = require("../Services/responsableService");

const responsableController = express.Router();



// *********** Sign Up Responsable ****************
const signUpResponsable = (req, res) => {
  const responsable = req.body;

  responsableService.createResponsable(responsable, (error, responsableId) => {
    if (error) {
      console.error('Error creating responsable:', error);
      res.status(500).send(error);
      return;
    }

    res.json({ responsableId });
  });
};
responsableController.post("/signUpResponsable",signUpResponsable);

// *********** Log In Responsable ****************
const loginResponsable = (req, res) => {
  const { email, password } = req.body;

  responsableService.ResponsableLogin(email, password, (error, Responsable) => {
    if (error) {
      console.error('Error LogIn:', error);
      res.status(500).send(error);
      return;
    }

      res.json({ ' idResponsable ':  Responsable });
  });
};
responsableController.post("/loginUpResponsable", loginResponsable);

// ******* Modifier lieu **********
const modifierLieu = (req, res) => {
  const { idPointInteret, titre, description, adresse, valide, latitude, longitude, idResponsable } = req.body;
  
  responsableService.modifierLieu(idPointInteret, titre, description, adresse, valide, latitude, longitude, idResponsable, (error, result) => {
    if (error) {
      console.error('Erreur lors de la modification du lieu :', error);
      res.status(400).json({ message: error });
      return;
    }
  
    res.json({ message: result });
  });
};
responsableController.post("/modifierLieu",modifierLieu);


responsableController.post(
  "/ajouterLieu/:idResponsable",
  async (req, res, next) => {
    try {
      await responsableService.AjouterLieu(
        req.body.idResponsable,
        req.body.lieu,
        req.body.photos,
        req.body.themes,
        req.body.categories,
        req.body.horaires,
        req.body.arretsTransport
      );
    } catch (error) {
      console.error(error);
    }
    res.status(200).send("Lieu ajouté avec succés");
    next();
  }
);


responsableController.delete(
  "/SupprimerCommentaire/:idCommentaire",
  async (req, res, next) => {
    try {
      await responsableService.SupprimerCommentaire(req.params.idCommentaire);
      res.status(200).send("Commentaire supprimé avec succés");
      next();
    } catch (e) {
      console.error(e);
      res.status(500).send(e.message);
    }
  }
);

responsableController.post("/AjouterQuiz/:idPI", async (req, res, next) => {
  try {
    await responsableService.AjouterQuiz(req.params.idPI, req.body);
    res.status(200).send("Quiz ajouté avec succés");
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

responsableController.post(
  "/AjouterEvenement/:idPI",
  async (req, res, next) => {
    try {
      await responsableService.AjouterEvenement(req.params.idPI, req.body);
      res.status(200).send("Evenement ajouté avec succés");
      next();
    } catch (e) {
      console.error(e);
      res.status(500).send(e.message);
    }
  }
);

responsableController.post("/AjouterOffre/:idPI", async (req, res, next) => {
  try {
    await responsableService.AjouterOffre(req.params.idPI, req.body);
    res.status(200).send("Offre ajoutée avec succés");
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

responsableController.get(
  "/AfficherStatistiques/:idPI",
  async (req, res, next) => {
    try {
      const result = await responsableService.AfficherStatistiques(
        req.params.idPI
      );
      res.status(200).send(result);
      next();
    } catch (e) {
      console.error(e);
      res.status(500).send(e.message);
    }
  }
);

module.exports = responsableController;

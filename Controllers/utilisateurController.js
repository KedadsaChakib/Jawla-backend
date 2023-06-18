express = require("express");
const utilisateurService = require("../Services/utilisateurService");

const utilisateurController = express.Router();


utilisateurController.post(
  "/signUpUtilisateur",
  async (req, res, next) => {
    try {
      await utilisateurService.createutilisateur(
        req.body.nom,
        req.body.prenom,
        req.body.mail,
        req.body.motdepasse,
        req.body.numeroDeTel
      );
      res.status(200).send("Utilisateur créé avec succés");
      next();
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
    next();
  }
);


utilisateurController.post("/loginutilisateur", async (req, res, next) => {
  try {
    const utilisateurId = await utilisateurService.loginUser(
      req.body.email,
      req.body.password
    );
    res.status(200).json({ utilisateurId });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

const GoogleLogin = (req, res) => {

  const {nom, prenom , email } = req.body;

  utilisateurService.authGoogle(nom, prenom,email, (error, message) => {
    if (error) {
      console.error('Erreur lors de l\'authentification de l\'utilisateur:', error);
      res.status(500).json({ error: 'Erreur du serveur' });
      return;
    }

    res.json({ message });
  });
};


utilisateurController.post("/GoogleLogin", GoogleLogin);


const mod_motDePasse = (req, res) => {
  
  const { email, nouv_password } = req.body;

  utilisateurService.motDePasse_oublie(email, nouv_password, (error, message) => {
    if (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe :', error);
      res.status(400).json({ message: error });
      return;
    }

    res.json({ message });
  });
};

utilisateurController.post("/mod_motDePasse", mod_motDePasse);




utilisateurController.get("/showtables", async (req, res, next) => {
  try {
    const result = await utilisateurService.showtables();
    res.status(200).send(result);
    next();
  } catch (e) {
    res.status(500).send(e.message);
  }
});

utilisateurController.post(
  "/AjouterCommentaire/:idUser/:idPI",
  async (req, res, next) => {
    try {
      const result = await utilisateurService.AjouterCommentaire(
        req.params.idUser,
        req.params.idPI,
        req.body.commentaire,
        req.body.nombreEtoile
      );
      res.status(200).send("Commentaire ajouté avec succés");
      console.log("comm");
      next();
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
);

utilisateurController.get("/AfficherQuiz/:idPI", async (req, res, next) => {
  try {
    const result = await utilisateurService.AfficherQuiz(req.params.idPI);
    res.status(200).send(result);
    next();
  } catch (e) {
    res.status(500).send(e.message);
  }
});

utilisateurController.get(
  "/AfficherDetailsPI/:idPI",
  async (req, res, next) => {
    try {
      const result = await utilisateurService.AfficherDetailsPI(
        req.params.idPI
      );
      res.status(200).send(result);
      next();
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
);

utilisateurController.get("/getCoordoones", async (req, res, next) => {
  try {
    const result = await utilisateurService.getCoordoones();
    res.status(200).send(result);
    next();
  } catch (e) {
    res.status(500).send(e.message);
  }
});

utilisateurController.post(
  "/AjouterAuFavoris/:idUser/:idPI",
  async (req, res, next) => {
    try {
      const result = await utilisateurService.AjouterAuFavoris(
        req.params.idUser,
        req.params.idPI
      );
      res.status(200).send("Ajouté avec succés");
      next();
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
);

utilisateurController.get(
  "/AfficherFavoris/:idUser",
  async (req, res, next) => {
    try {
      const result = await utilisateurService.AfficherFavoris(
        req.params.idUser
      );
      res.status(200).send(result);
      next();
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
); 

utilisateurController.post(
  "/IncrementerNombreVisite/:idPI",
  async (req, res, next) => {
    try {
      const result = await utilisateurService.IncrementerNbrVisites(
        req.params.idPI
      );
      res.status(200).send("Incrémenté avec succés");
      next();
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
); 



//Afficher details Pi by idPI

module.exports = utilisateurController;

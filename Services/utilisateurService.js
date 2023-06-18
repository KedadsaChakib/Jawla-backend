pool = require("../database.js");

async function showtables() {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query("show tables");
    return users;
  } finally {
    connection.release();
  }
}

// *************** Sign Up *************


// La syntaxe de l'adresse mail valide
const emailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Début de la fonction
async function createutilisateur(
  nom,
  prenom,
  mail,
  motdepasse,
  numeroDeTel
) {
  const connection = await pool.getConnection();
  try {
    // Vérification que l'adresse e-mail est valide
    if (!emailformat.test(mail)) {
      throw new Error("Adresse mail invalide.");
    }

    // Vérification de l'existence de l'e-mail dans la base de données
    const [emailResult] = await connection.query(
      'SELECT COUNT(*) AS emailCount FROM utilisateur WHERE mail = ?;',
      [mail]
    );
    const emailCount = emailResult[0].emailCount;
    if (emailCount > 0) {
      throw new Error("L'adresse mail existe déjà.");
    }

    // Vérification de l'existence du numéro de téléphone dans la base de données
    const [phoneNumberResult] = await connection.query(
      'SELECT COUNT(*) AS phoneNumberCount FROM utilisateur WHERE numeroDeTel = ?;',
      [numeroDeTel]
    );
    const phoneNumberCount = phoneNumberResult[0].phoneNumberCount;
    if (phoneNumberCount > 0) {
      throw new Error("Le numéro de téléphone existe déjà.");
    }

    // Ajout de l'utilisateur à la BDD
    const query = 'INSERT INTO utilisateur (nom, prenom, mail, motdepasse, numeroDeTel) VALUES (?, ?, ?, ?, ?)';
    const insertResult = await connection.query(query, [nom, prenom, mail, motdepasse, numeroDeTel]);
    const result = insertResult.insertId;

    return result;
  } catch (e) {
    throw e;
  } finally {
    connection.release();
  }
}

// *************** Log In *************
async function loginUser(
  email,
  password
){
  const connection = await pool.getConnection();
  try {

    // exécution de la requete (recherche de l'utilisateur qui a comme adresse , l'adresse entrée)
      const [results] = await connection.query(
        'SELECT * FROM utilisateur WHERE mail = ?;',
        [email]
      );
         console.log(email);
      if (results.length == 0) {
        throw new Error("Adresse mail incorrecte");
      }
    // affectation de l'utilisateur trouvé à la constante user
    const user = results[0];
    // Vérification du mot de passe
    if (user.motDePasse !== password) {
      // si cette condition n'est pas vérifiée c'est à dire que "le mot de passe entré est incorrect"
      throw new Error("Mot de passe incorrect");
    }
    // Sinon retourner l'id de l'utilisateur connecté
    const userId = user.idUtilisateur;
    return userId;
  } catch (e) {
    throw e;
  } finally {
    connection.release();
  }
}


const authGoogle = (nom, prenom, email, callback) => {
  // On va vérifier si l'email existe déjà dans la base de données
  const query = "SELECT COUNT(*) AS emailCount FROM utilisateur WHERE mail = ?";
  // exécution de la requete
  database.query(query, [email], (error, results) => {
    if (error) {
      console.error("Erreur lors de l'exécution de la requête:", error);
      callback("Erreur serveur", null);
      return;
    }

    const emailCount = results[0].emailCount;
    if (emailCount > 0) {
      // Si l'email existe déjà, on considére que l'utilisateur est connecté
      callback(null, "Utilisateur connecté");
    } else {
      // Si l'email n'existe pas, on crée un nouvel utilisateur et on affecte le nom,prenom et le mail à ces champs dans la BDD
      const nouv_util_query =
        "INSERT INTO utilisateur (nom, prenom, mail, motdepasse, numeroDeTel) VALUES (?, ?, ?, ?, ?)";
      const champs = [nom, prenom, email, null, null];

      database.query(nouv_util_query, champs, (error, results) => {
        if (error) {
          console.error("Erreur lors de l'ajout du nouvel utilisateur:", error);
          callback("Erreur serveur", null);
          return;
        }

        callback(null, "Le Nouvel utilisateur a été enregistré");
      });
    }
  });
};


// *************** Mot de passe oublié *************
const motDePasse_oublie = (email, nouv_motDePasse, callback) => {
  // Vérifier si l'adresse e-mail existe dans la base de données
  const checkExistEmailQuery =
    "SELECT COUNT(*) AS emailCount FROM utilisateur WHERE mail = ?";

  database.query(checkExistEmailQuery, [email], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      callback(error, null);
      return;
    }

    const emailCount = results[0].emailCount;
    if (emailCount === 0) {
      // Cette adresse e-mail n'existe pas
      const errorMessage = "Adresse e-mail incorrecte";
      callback(errorMessage, null);
      return;
    }

    // Mettre à jour le mot de passe
    const updatePasswordQuery =
      "UPDATE utilisateur SET motDePasse = ? WHERE mail = ?";

    database.query(
      updatePasswordQuery,
      [nouv_motDePasse, email],
      (error, results) => {
        if (error) {
          console.error("Error executing query:", error);
          callback(error, null);
          return;
        }

        // Afficher le succès de la réinitialisation du mot de passe
        callback(null, "Mot de passe réinitialisé avec succès");
      }
    );
  });
};

async function showtables() {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query("show tables");
    return users;
  } finally {
    connection.release();
  }
}









async function AjouterCommentaire(iduser, idPI, commentaire, nombreEtoile) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `insert into commentaire (nombreEtoile,texte,idUtilisateur,idPointInteret)
        values (?,?,?,?);`,
      [nombreEtoile, commentaire, iduser, idPI]
    );
  } finally {
    connection.release();
  }
}

async function AfficherQuiz(idPI) {
  const connection = await pool.getConnection();
  try {
    const [quiz] = await connection.query(
      `select * from quiz where idPointInteret = ?;`,
      [idPI]
    );
    const [Questions] = await connection.query(
      "select * from question where idQuiz = ?;",
      [quiz[0].idQuiz]
    );
    return { quiz, Questions };
  } finally {
    connection.release();
  }
}

//Theme,Categorie,Evenements,Offres,horaires,arretsTransport,responsable,commentaires
// Ajouter photos
async function AfficherDetailsPI(idPI) {
  const connection = await pool.getConnection();
  try {
    const [themes] = await connection.query(
      `Select designation from theme a JOIN (select idTheme from estdetheme 
      E where E.idPointInteret = ?) b ON  a.idTheme = b.idTheme;`,
      [idPI]
    );
    const [categories] = await connection.query(
      `Select designation from categorie a JOIN (select idCategorie from estdecategorie 
      E where E.idPointInteret = ?) b ON  a.idCategorie = b.idCategorie;`,
      [idPI]
    );
    const [evenements] = await connection.query(
      `select * from evenement where idPointInteret = ?;`,
      [idPI]
    );
    const [offres] = await connection.query(
      `select * from offre where idPointInteret = ?;`,
      [idPI]
    );
    const [horaires] = await connection.query(
      `select * from ouvrir where idPointInteret = ?;`,
      [idPI]
    );
    const [arretsTransport] = await connection.query(
      `select * from arrettransport where idPointInteret = ?;`,
      [idPI]
    );
    const [responsable] = await connection.query(
      `select nom,prenom,email,numerodetel from responsable R JOIN 
    (select idResponsable from PointInteret a WHERE a.idPointInteret = ?) b
    ON b.idResponsable = R.idResponsable;`,
      [idPI]
    );
    const [commentaires] = await connection.query(
      `select idCommentaire,nom,prenom,nombreEtoile,texte from utilisateur a JOIN (select * from commentaire where idPointInteret = ?) b 
    ON a.idUtilisateur = b.idUtilisateur`,
      [idPI]
    );
    const [photos] = await connection.query(
      `select idPhoto,path from photos where idPointInteret = ?`,
      [idPI]
    );

    return {
      themes,
      categories,
      evenements,
      offres,
      horaires,
      arretsTransport,
      commentaires,
      responsable,
      photos
    };
  } finally {
    connection.release();
  }
}

async function getCoordoones() {
  const connection = await pool.getConnection();
  try {
    const [points] = await connection.query(
      "select idPointInteret,latitude,longitude from pointInteret natural join (select * from coordoones) as c"
    );
    return points;
  } finally {
    connection.release();
  }
}

async function AjouterAuFavoris(idUtilisateur, idPI) {
  const connection = await pool.getConnection();
  try {
    await connection.query(`insert into favoriser (idUtilisateur,idPointInteret) values (?,?)`, [
      idUtilisateur,
      idPI,
    ]);
  } finally {
    connection.release();
  }
}

async function AfficherFavoris(idUtilisateur) {
  const connection = await pool.getConnection();
  try {
    const [favoris] = await connection.query(
      `select * from pointinteret p Natural JOIN (select * from favoriser where idUtilisateur = ?) as f`,
      [idUtilisateur]
    );
    return favoris;
  } finally {
    connection.release();
  }
}

async function IncrementerNbrVisites(idPI) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `update stqtistiques set nbrVisites = nbrVisites + 1 where idPointInteret = ?`,
      [idPI]
    );
  } finally {
    connection.release();
  }
}

module.exports = {
  showtables,
  AjouterCommentaire,
  AfficherQuiz,
  AfficherDetailsPI,
  getCoordoones,
  AjouterAuFavoris,
  AfficherFavoris,
  IncrementerNbrVisites,
  loginUser,
  createutilisateur,
  authGoogle,
  motDePasse_oublie
};

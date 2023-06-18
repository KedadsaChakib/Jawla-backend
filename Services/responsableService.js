pool = require("../database.js");

//Ajouter lieu: idRespo(int), lieu: {titre,description,adresse,latitude,longitude},photos:[paths],themes:[int],
//categories,ajouter ligne coordoones, horaires:[{jour(str),heureDebut(int),heureFin(int)}],
//arretsTransport:[{nom,type(str: bus|train|tram|metro),idPI}]]

async function AjouterLieu(
  idResponsable,
  lieu,
  themes,
  categories,
  arretsTransport
) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `insert into pointinteret 
          (titre,description,Adresse,valide,latitude,longitude,idResponsable)
           values (?,?,?,0,?,?,?);`,
      [
        lieu.titre,
        lieu.description,
        lieu.adresse,
        lieu.latitude,
        lieu.longitude,
        idResponsable,
      ]
    );
    var idPI = await connection.query(
      `select last_insert_id(idPointInteret) from pointinteret order by LAST_INSERT_ID(idPointinteret) desc limit 1;`
    );
    idPI = idPI[0][0]["last_insert_id(idPointInteret)"]; // id du point d'interet ajouté

    await connection.query(`insert into coordoones values (?,?)`, [
      lieu.latitude,
      lieu.longitude,
    ]);

    await connection.query(
      `insert into statistiques(nbrVisites,nbrQuizsPris,idPointInteret) values (?,?,?)`,
      [0, 0, idPI]
    );
    for (var theme of themes) {
      await connection.query(`insert into estdetheme values (?,?)`, [
        idPI,
        theme,
      ]);
    }

    for (var categorie of categories) {
      await connection.query(`insert into estdecategorie values (?,?)`, [
        idPI,
        categorie,
      ]);
    }
    for (var path of photos) {
      await connection.query(
        `insert into photos(path,alt,idPointInteret) values (?,?,?)`,
        [path, lieu.titre, idPI]
      );
    }
    // for (var horaire of horaires) {
    //   await connection.query(`insert into ouvrir values (?,?,?,?)`, [
    //     idPI,
    //     horaire.jour,
    //     horaire.heureDebut,
    //     horaire.heureFin,
    //   ]);
    // }
    for (var arret of arretsTransport) {
      await connection.query(
        `insert into arrettransport(nom,type,idPointInteret) values (?,?,?)`,
        [null, arret.type, idPI]
      );
    }
  } finally {
    connection.release();
  }
}

// A discuter
//async function ModifierLieu(idPI) {}

// Le responsable a le id de chaxque commentaire, dans aficher details lieu le id des commentaires est retourné
async function SupprimerCommentaire(idCommentaire) {
  const connection = await pool.getConnection();
  try {
    await connection.query(`delete from commentaire where idCommentaire = ?`, [
      idCommentaire,
    ]);
  } finally {
    connection.release();
  }
}

// quiz : {nbquestions,questions: [ {question,choix1,choix2,choix3,choix4,choixJuste,reponseDetaillé} ]   }
async function AjouterQuiz(idPI, quiz) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `insert into quiz(NbQuestions,idPointinteret) values(?,?)`,
      [quiz.nbquestions, idPI]
    );

    var idQuiz = await connection.query(
      `select last_insert_id(idQuiz) from quiz order by LAST_INSERT_ID(idQuiz) desc limit 1;`
    );
    idQuiz = idQuiz[0][0]["last_insert_id(idPointInteret)"];

    for (var question of quiz.questions) {
      await connection.query(
        `insert into question(question,choix1,choix2,choix3,choix4,choixJuste,reponseDetaille,idQuiz)
             values(?,?,?,?,?,?,?,?)`,
        [
          question.question,
          question.choix1,
          question.choix2,
          question.choix3,
          question.choix4,
          question.choixJuste,
          question.reponseDetaillé,
          idQuiz,
        ]
      );
    }
  } finally {
    connection.release();
  }
}

// evenement = {titre,description,date}   // date:'YYYY-MM-DD'
async function AjouterEvenement(idPI, evenement) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `insert into evenement(titre,description,date,idPointInteret) values(?,?,?,?)`,
      [evenement.titre, evenement.description, evenement.date, idPI]
    );
  } finally {
    connection.release();
  }
}

// offre = {designation,prixOriginal(decimal),reduction(decimal),dateDebut,dateFin}   // date:'YYYY-MM-DD'
async function AjouterOffre(idPI, offre) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `insert into offre(Designation,PrixOriginal,reduction,dateDebut,DateFin,idPointInteret) values(?,?,?,?,?,?)`,
      [
        offre.designation,
        offre.prixOriginal,
        offre.reduction,
        offre.dateDebut,
        offre.dateFin,
        idPI,
      ]
    );
  } finally {
    connection.release();
  }
}
async function AfficherStatistiques(idPI) {
  const connection = await pool.getConnection();
  try {
    var [statistiques] = await connection.query(
      `select nbrVisites,nbrQuizsPris from statistiques where idPointInteret = ?`,
      [idPI]
    );
    var [nbrCommentaires] = await connection.query(
      `select count(*) from commentaire where idPointInteret = ?`,
      [idPI]
    );
    var [nbrFavoris] = await connection.query(
      `select count(*) from favoris where idPointInteret = ?`,
      [idPI]
    );
    var [avgRatings] = await connection.query(
      `select avg(nbrEtoile) from commentaire where idPointInteret = ?`,
      [idPI]
    );
    return { statistiques, nbrCommentaires, nbrFavoris, avgRatings };
  } catch (err) {
    console.log(err);
  } finally {
    connection.release();
  }
}

const createResponsable = (responsable, callback) => {
  // Definition des constantes/requetes
  const queryCheckEmail =
    "SELECT COUNT(*) AS emailCount FROM responsable WHERE email = ?";
  const queryCheckPhoneNumber =
    "SELECT COUNT(*) AS phoneNumberCount FROM responsable WHERE numeroDeTel = ?";
  // lire les informations du responsable
  const query =
    "INSERT INTO responsable (nom, prenom, email, motDepasse, numeroDeTel) VALUES (?, ?, ?, ?, ?)";
  const { nom, prenom, mail, motdepasse, numeroDeTel } = responsable;

  // l'adresse mail doit etre de la forme R_1ere lettre du prenom_nom@jawla.dz
  // Vérification du nom et de la première lettre du prenom dans l'adresse e-mail
  const firstLetterOfPrenom = prenom.charAt(0).toLowerCase();
  // la syntaxe de l'adresse mail valide
  const mailVerif = `R${firstLetterOfPrenom}_${nom.toLowerCase()}@jawla.dz`;

  console.log(mailVerif);

  // Vérification que l'adresse e-mail est valide
  if (mail !== mailVerif) {
    const errorMessage = "Adresse mail invalide.";
    callback(errorMessage, null);
    return;
  }

  // Vérification de l'unicité de l'adresse e-mail
  database.query(queryCheckEmail, [mailVerif], (error, emailResult) => {
    if (error) {
      console.error("Error executing email check query:", error);
      callback(error, null);
      return;
    }

    const emailCount = emailResult[0].emailCount;
    if (emailCount > 0) {
      const errorMessage = "L'adresse mail existe déjà.";
      callback(errorMessage, null);
      return;
    }

    // Vérification de l'unicité du numéro de téléphone
    database.query(
      queryCheckPhoneNumber,
      [numeroDeTel],
      (error, phoneNumberResult) => {
        if (error) {
          console.error("Error executing phone number check query:", error);
          callback(error, null);
          return;
        }

        const phoneNumberCount = phoneNumberResult[0].phoneNumberCount;
        if (phoneNumberCount > 0) {
          const errorMessage = "Le numéro de téléphone existe déjà.";
          callback(errorMessage, null);
          return;
        }

        // Insertion du responsable dans la BDD
        database.query(
          query,
          [nom, prenom, mailVerif, motdepasse, numeroDeTel],
          (error, results) => {
            if (error) {
              console.error("Error executing user insertion query:", error);
              callback(error, null);
              return;
            }

            const responsableId = results.insertId;
            callback(null, responsableId);
          }
        );
      }
    );
  });
};
// *************** Log In *************
const ResponsableLogin = (email, password, callback) => {
  // Definition de la requete
  const query = "SELECT * FROM responsable WHERE email = ?";
  // exécution de la requete (recherche du responsable qui a comme adresse , l'adresse entrée)
  database.query(query, [email], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      callback(error, null);
      return;
    }

    // verification de l'existance de l'adresse
    if (results.length === 0) {
      // si l'ensemble de resultat est vide c'est à dire "aucun responsable n'est inscrit avec cette adresse mail"
      const errorMessage = "Adresse mail incorrecte";
      callback(errorMessage, null);
      return;
    }

    // affectation du responsable trouvé à la constante responsable
    const responsable = results[0];
    // Vérification du mot de passe
    if (responsable.motDepasse !== password) {
      // si cette condition n'est pas vérifiée c'est à dire que "le mot de passe entré est incorrect"
      const errorMessage = "Mot de passe incorrect";
      callback(errorMessage, null);
      return;
    }

    // Sinon retourner l'id du responsable connecté
    const responsableId = responsable.idResponsable;
    callback(null, responsableId);
  });
};
// *************** Modifier les informations d'un point d'interet *************
const modifierLieu = (
  idPointInteret,
  titre,
  description,
  Adresse,
  valide,
  latitude,
  longitude,
  idResponsable,
  callback
) => {
  // préparation de la requete SQL
  const query =
    "UPDATE pointinteret SET titre = ?, description = ?, Adresse = ?, valide = ?, latitude = ?, longitude = ?, idResponsable = ? WHERE idPointInteret = ?";

  // Vérification si le idResponsable qui veut modifier est le même idResponsable correspondant à ce lieu en BDD (le responsable qui a créé le lieu)
  const reqrespo =
    "SELECT COUNT(*) AS responsableCount FROM pointinteret WHERE idPointInteret = ? AND idResponsable = ?";

  database.query(
    reqrespo,
    [idPointInteret, idResponsable],
    (error, results) => {
      if (error) {
        console.error(
          "Erreur lors de la vérification du responsable du lieu :",
          error
        );
        callback(error, null);
        return;
      }

      const responsableCount = results[0].responsableCount;
      if (responsableCount === 0) {
        const errorMessage =
          "Le responsable du lieu ne correspond pas au responsable qui veut modifié";
        callback(errorMessage, null);
        return;
      }

      // exécution de la requete
      database.query(
        query,
        [
          titre,
          description,
          Adresse,
          valide,
          latitude,
          longitude,
          idResponsable,
          idPointInteret,
        ],
        (error, results) => {
          if (error) {
            console.error(
              "Erreur lors de la modification du point d'interet :",
              error
            );
            callback(error, null);
            return;
          }

          callback(null, "Lieu modifié");
        }
      );
    }
  );
};



module.exports = {
  AjouterLieu,
  SupprimerCommentaire,
  AjouterQuiz,
  AjouterEvenement,
  AjouterOffre,
  AfficherStatistiques,
  createResponsable,
  ResponsableLogin,
  modifierLieu
};
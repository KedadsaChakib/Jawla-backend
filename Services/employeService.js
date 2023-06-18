pool = require("../database.js");

async function EmployeLogin(
  email,
  password
){
  const connection = await pool.getConnection();
  try {
    
// exécution de la requete (recherche de l'employé qui a comme adresse , l'adresse entrée)

    const [query] = await connection.query(
      'SELECT * FROM employé WHERE email = ?;',
      [email]
    );
    // verification de l'existance de l'adresse
    if (query.length === 0) {
      // si l'ensemble de resultat est vide c'est à dire "aucun employé n'est inscrit avec cette adresse mail"
      throw new Error("Adresse mail incorrecte");
    }
    // affectation de l'employé trouvé à la constante employe
    const employe = query[0];
    // Vérification du mot de passe
    if (employe.motDepasse !== password) {
      // si cette condition n'est pas vérifiée c'est à dire que "le mot de passe entré est incorrect"
      throw new Error("Mot de passe incorrect");
    }
    // Sinon retourner l'id de l'employé connecté
       
    return employe;
  } catch (e) {
    throw e;
  } finally {
    connection.release();
  }
}




async function AfficherDemandes() {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      `select * from pointinteret p join responsable r on p.idResponsable=r.idResponsable where valide=0`
    );
    return result;
  } catch (e) {
    throw e;
  } finally {
    connection.release();
  }
}

async function AccepterDemande(idPI) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `update pointinteret set valide=1 where idPointInteret=?`,
      [idPI]
    );
  } catch (e) {
    throw e;
  } finally {
    connection.release();
  }
}

async function AfficherStatsGlobales() {
  const connection = await pool.getConnection();
  try {
    const [[nbrVisites]] = await connection.query(
      "select sum(nbrVisites) from statistiques"
    );
    const [[nbrLieux]] = await connection.query(
      "select count(*) from pointinteret"
    );
    const [[nbrEvenements]] = await connection.query(
      "select count(*) from evenment"
    );
    return { nbrVisites, nbrLieux, nbrEvenements };
  } catch (e) {
    throw e;
  } finally {
    connection.release();
  }
}

module.exports = {
  AfficherDemandes,
  AccepterDemande,
  AfficherStatsGlobales,
  EmployeLogin
};

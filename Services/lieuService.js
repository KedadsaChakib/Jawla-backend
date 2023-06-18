pool = require("../database.js");

async function getLieux() {
  const connection = await pool.getConnection();
  try {
    const [lieux] = await connection.query(
      "select * from pointinteret p join responsable r on p.idResponsable=r.idResponsable where valide=1"
    );
    return lieux;
  } finally {
    connection.release();
  }
}


async function Rechercher(term, category, theme,etatOuverture){
    const connection = await pool.getConnection();
    try {
      console.log("2","'",term,"'", category, theme, etatOuverture);
      if (!term && !category && !theme && !etatOuverture){
        const [lieux] = await connection.query(
          "select * from pointinteret where valide=1"
        );
        return lieux;
      }

      let query = `
        SELECT *
        FROM pointinteret
        WHERE 1=1
      `;

      if (term) {
        const keywords = term.split(' ');
      query += ' AND (';
      keywords.forEach((keyword, index) => {
        if (index !== 0) {
          query += ' AND';
        }
        query += ` (titre LIKE '%${keyword}%' OR Adresse LIKE '%${keyword}%')`;
      });
      query += ')';
      }

      if (category) {
        query += `
          AND idPointInteret IN (
            SELECT idPointInteret
            FROM estdecategorie
            WHERE idCategorie = (
              SELECT idCategorie
              FROM categorie 
              WHERE designation = '${category}'
            )
          )
        `;
      }
  
      if (theme) {
        query += `
          AND idPointInteret IN (
            SELECT idPointInteret
            FROM estdetheme
            WHERE idTheme = (
              SELECT idTheme
              FROM theme
              WHERE designation = '${theme}'
            )
          )
        `;
      }
      if (etatOuverture) {
        const currentDate = new Date();
        const options = { weekday: 'long' };
        const currentDayName = currentDate.toLocaleDateString('fr-FR', options);
        query += `
          AND idPointInteret IN (
            SELECT idPointInteret
            FROM ouvrir
            WHERE jour= '${currentDayName}' AND heureOuverture <= CURRENT_TIME AND heurefin > CURRENT_TIME
          )
        `;
      }
      console.log(query);
      const [results] = await connection.execute(query);
      return results;
    } catch (err) {
      console.error('Error connecting to MySQL:', err);
    } finally {
      connection.release(); // Libérer la connexion à la base de données
    }
  }
  
  /**
   const connection = await pool.getConnection(); // Assuming getConnection() returns a valid MySQL connection
   */

   async function Supprimer(id) {
       const connection = await pool.getConnection()
    try {
       var query=`delete from pointinteret where idPointInteret ='${id}'`
       const [results] = await connection.execute(query);
       return results;
   }
   catch (err) {
    console.error('Error connecting to MySQL:', err);
  } finally {
    connection.release(); // Libérer la connexion à la base de données
  }
}


   module.exports = {Rechercher,Supprimer, getLieux}

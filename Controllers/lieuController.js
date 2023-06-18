const express = require('express');
const lieuService = require("../Services/lieuService.js");

const router = express.Router();

router.get('/', async (req,res,next)=>{
    try {
        const result = await lieuService.getLieux();
        res.status(200).send(result);
        next();
      } catch (e) {
        res.status(500).send(e.message);
      }
})

router.delete('/SupprimerLieu/:id',async (req,res,next)=>{
    const id = req.params.id;
    try {
        const result = await lieuService.Supprimer(id);
        res.status(200).send(result);
      } catch (e) {
        res.status(500).send(e.message);
      }
})


router.post("/RechercheLieu", async (req, res) => {
    const { term, category, theme, etatOuverture } = req.body;
    console.log(req.body)
    try {
        console.log("1",term,category,theme,etatOuverture);
      const result = await lieuService.Rechercher(term,category,theme,etatOuverture,res);
      //console.log(result)
      //res.status(200).json({message:"Succes"})
      res.status(200).json(result);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
  module.exports = router;
  
  //URL  = http://localhost:3000/lieu/RechercheLieu?term=cruz%20Alger&category=Monument historique
//   let query = `
//   SELECT * 
//   FROM (SELECT *
//     FROM (
//         SELECT idPointInteret,idCategorie 
//         FROM EstdeCategorie 
//         NATURAL JOIN (
//             SELECT idCategorie,designation
//             FROM categorie WHERE 
//             designation='${category}'
//             ))
//             NATURAL JOIN(
//                 SELECT idPointInteret,idTheme 
//                 FROM EstdeTheme
//                 NATURAL JOIN (
//                     SELECT idtheme,designation 
//                     FROM theme 
//                     WHERE designation='${theme}'))
//         )
//   NATURAL JOIN(
//     SELECT idPoinInteret 
//     FROM PointInteret 
//     WHERE titre like '%${term}%')
//   `;


/*
router.post('/AjouterLieu',(req,res,next)=> {
    
let product = req.body;
query = "insert into Wilaya (idWilaya,nom) values (?,?)"
connection.query(query,[product.idWilaya,product.nom],(err,results)=>{
    if(!err){
        return res.status(200).json({message:"Product Added Successfully"});
    }else{
        return res.status(500).json(err)
    }
})
})
*/
/*
router.get('/AfficherLieu/:id',(req,res)=>{
     try {
        const result = await lieuService.Supprimer(id);
        res.status(200).send(result);
      } catch (e) {
        res.status(500).send(e.message);
      }
})
*/
/*
//Pour modifier il faut verifier si celui qui modifie est le respo
router.patch('/ModifierLieu/:id',(req,res,next)=>{
    const id = req.params.id;
    let product = req.body;
    var query = "update product set name =?,description=?,price=? where id=?";
    connection.query(query,[product.name,product.description,product.price,id],(err,results)=>{
        if(!err){
            if(results.affectedRows==0){
                return res.status(404).json({message:"Product id is not found"})
            }
            return res.status(200).json({message:"Product updated successfully"})
        }else{
            return res.status(500).json(err);
        }
    })
})
*/

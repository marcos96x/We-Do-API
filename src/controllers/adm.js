/**
 * Diretório - ./src/controllers/adm.js
 */
const database = require("../models/database")()

/**
 * Alterar o nome / descrição de uma tecnologia
 * 
 * @param void
 * 
 * @body 
 * "tecnologia": {
 *      "id_tecnologia": id,
 *      "nm_tecnologia": Nome da tecnologia,
 *      "ds_tecnologia": descricao
 * }
 * 
 * @return JSON {msg} / {err}
 * 
 */
exports.altera_tecnologia = (req, res) => {
    let id_tecnologia = req.body.tecnologia.id_tecnologia
    let nm_tecnologia = req.body.tecnologia.nm_tecnologia
    let ds_tecnologia = req.body.tecnologia.ds_tecnologia
    
    let update = {
        nm_tecnologia: nm_tecnologia,
        ds_tecnologia: ds_tecnologia
    }
    database.query("UPDATE tb_tecnologia SET ? WHERE id_tecnologia = ?", [update, id_tecnologia], (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: err}).end()
        }else{
            return res.status(200).send({msg: "Ok"}).end()
        }
    })    
}

/** 
 * Busca um usuário pelo nome
 * 
 * @param void
 * 
 * @body "busca": "Busca"
 * 
 * @return JSON {usuario} / {err}
*/
exports.pesquisa_usuario = (req, res) => {
    let busca = req.body.busca

    database.query("SELECT * FROM tb_usuario WHERE nm_usuario LIKE '%" + busca + "%'", (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: err}).end()
        }else{
            return res.status(200).send({usuario: rows}).end()
        }
    })
}

/** 
 * Pesquisa por todas as tecnologias
 * 
 * @param void
 * 
 * @body void
 * 
 * @return JSON {tecnologias} / {err}
*/
exports.pesquisa_tecnologia = (req, res) => {
    database.query("SELECT * FROM tb_tecnologia", (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: err}).end()
        }else{
            return res.status(200).send({tecnologias: rows}).end()
        }
    })
}
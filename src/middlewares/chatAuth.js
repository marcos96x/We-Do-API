// src/middlewares/chatAuth.js
const database = require("../models/database")()

exports.auth = (req, res, next) => {
    
    let id_usuario = req.params.id_usuario
    let id_ideia = req.params.id_ideia
    
    database.query("SELECT * FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ?", [id_usuario, id_ideia], (err, rows, fields) => {
        if(err){
            return res.status(401).send({err: "Erro ao verificar integridade do usuario"}).end()
        }else{
            if(rows.length == []){
                return res.status(401).send({err: "Usuario sem permissao de acessar o chat"}).end()
            }else{                
                if(rows[0].status_solicitacao == "1"){                    
                    next()
                }else{
                    return res.status(401).send({err: "Usuario não tem acesso ao chat"}).end()
                }
                
            }
        }
    })
    
}
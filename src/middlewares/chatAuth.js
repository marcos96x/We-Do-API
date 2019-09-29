// src/middlewares/chatAuth.js
const database = require("../models/database")()

exports.auth = (req, res, next) => {
    
    let id_usuario = req.params.id_usuario
    let id_ideia = req.body.ideia.id_ideia
    
    database.query("SELECT * FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ?", [id_usuario, id_ideia], (err, rows, fields) => {
        if(err){
            res.status(401).send({err: "Erro ao verificar integridade do usuario"})
            res.end()
        }else{
            if(rows.length == []){
                res.status(401).send({err: "Usuario sem permissao de acessar o chat"})
                res.end()
            }else{                
                
                if(rows[0].status_solicitacao == "1"){                    
                    next()
                }else{
                    res.status(401).send({err: "Usuario não tem acesso ao chat"})
                    res.end()
                }
                
            }
        }
    })
    
}
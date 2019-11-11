/**
 * Diretório - ./src/controllers/chat.js
 */

const database = require("../models/database")()
const jwt = require("jsonwebtoken")
const authConfig = require("../../libs/auth")

/**
 * Gera os token de autenticação
 * 
 * @param {id_usuario}
 * 
 * @return token 
 */
function geraToken(params = {}){
    return jwt.sign(params , authConfig.secret, {
        expiresIn: 86400
    })
}

/**
 * Mostra todas as mensagens de um determinado chat
 * 
 * @param id_usuario&id_ideia
 * 
 * @body void
 *
 * @return JSON {chat, token}  / JSON {err}
 */
exports.recebe_mensagem = (req, res) => {
    let id_ideia = req.params.id_ideia
    let id_usuario = req.params.id_usuario

    
    database.query("CALL spVisualiza_chat(?, ?)", [id_ideia, id_usuario], (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: "Erro na busca das mensagens"}).end()            
        }else{
            let newToken = "Bearer " + geraToken({id: id_usuario})
            return res.status(200).send({
                chat: rows,
                token: newToken
            }).end()
        }
    })  
}

/**
 * Efetua o envio da mensagem em determinado chat
 * 
 * @param id_usuario&id_ideia
 * 
 * @body  "mensagem": {
     *      "ct_mensagem": "conteúdo"
     *    },
     *    "ideia": {
     *      id_ideia: id_da_ideia
     *    }
 *
 * @return JSON {msg, token}  / JSON {err}
 */
exports.envia_mensagem = (req, res) => {
    let ct_mensagem = req.body.mensagem.ct_mensagem
    let id_usuario = req.params.id_usuario
    let id_ideia = req.params.id_ideia
    
    database.query("CALL spInsere_chat(?, ?, ?)", [id_usuario, id_ideia, ct_mensagem], (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: err}).end()
        }else{            
            let newToken = "Bearer " + geraToken({id: id_usuario})
            return res.status(200).send({msg: "OK", token: newToken}).end()
        }
    })
}
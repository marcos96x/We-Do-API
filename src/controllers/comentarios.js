/**
 * Diretorio - src/controllers/comentarios.js
 */

const database = require("../models/database")()
const jwt = require("jsonwebtoken")
const authConfig = require("../../libs/auth")

function geraToken(params = {}){
    return jwt.sign(params , authConfig.secret, {
        expiresIn: 86400
    })
}

/**
 * Mostra todos os comentários relacionados à uma determinada idéia
 * 
 * @param id_usuario
 * 
 * @body "ideia": {
 *          "id_ideia": id_da_ideia
 *       }
 * 
 * @return JSON {comentarios, token} / {err}
 */

exports.mostra_comentarios = (req, res) => {

    let id_usuario = req.params.id_usuario
    let id_ideia = req.body.ideia.id_ideia   
    
    database.query("SELECT * FROM mensagens WHERE uso_mensagem = 2 AND id_ideia = ?", id_ideia, (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: "Erro na busca dos comentarios"}).end()
        }else{
            let newToken = "Bearer " + geraToken({id: id_usuario})

            return res.status(200).send({
                comentarios: rows,
                token: newToken
            }).end()
        }
    })     
}

/**
 * Envia um novo comentário para uma determinada ideia
 * 
 * @param id_usuario
 * 
 * @body "mensagem": {
 *           "ct_mensagem": "conteúdo"
 *       },
 *       "ideia": {
 *           "id_ideia": id_da_ideia
 *       }
 * 
 * @return JSON {msg, token} / JSON {err}
 */
exports.envia_comentario = (req, res) => {

    let id_usuario = req.params.id_usuario
    let ct_mensagem = req.body.mensagem.ct_mensagem    
    let id_ideia = req.body.ideia.id_ideia
    
    database.query("INSERT INTO tb_mensagem VALUES (default, ?, NOW(), ?, 2, ?)", [ct_mensagem, id_usuario, id_ideia], (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: "Não foi possivel inserir a mensagem"}).end()
        }else{           
            database.query("SELECT id_usuario FROM participante_ideia WHERE id_ideia = ? AND idealizador = 1", [id_ideia], (err4, rows4, fields4) => {
                if(err4){
                    res.status(403).send({err: err4}).end()
                }else{
                    database.query("UPDATE tb_notificacao SET id_ultimo_comentario = ? WHERE id_usuario = ?", [rows.insertId, rows4[0].id_usuario], (err2, rows2, fields2) => {
                        if(err2){
                            return res.status(403).send({err: err2}).end()
                        }else{
                            let newToken = geraToken({id: id_usuario})
                            return res.status(200).send({msg: "Curtiu", token: newToken}).end()
                        }
                    })   
                }
            })         
        }
    })    
}

/**
 * Apaga um comentario apenas se for um comentario digitado pelo usuario requisitante
 * 
 * @param id_usuario
 * 
 * @body "comentario":{
 *          "id_mensagem": id_da_mensagem
 *       }
 * 
 * @return JSON {msg, token} // {err}
 */
 
exports.apaga_comentario = (req, res) => {

    let id_usuario = req.params.id_usuario
    let id_mensagem = req.body.comentario.id_mensagem

    database.query("CALL spDeleta_mensagem(?, ?);", [id_usuario, id_mensagem], (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: err}).end();
        }else{
            if(rows[0][0].msg_erro){
                return res.status(200).send({msg_erro: rows[0][0].msg_erro}).end()
            }else if(rows[0][0].msg_sucesso){              
                let newToken = "Bearer " + geraToken({id: id_usuario})
                return res.status(200).send({
                    msg: "ok",
                    token: newToken
                }).end()
            }

        }
    })
}


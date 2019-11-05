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
*/

/**
 * Envia um novo comentário para uma determinada ideia
 * 
 * @param void
 * 
 * @body
 *      "usuario": {
 *          "id_usuario": id_do_usuario
 *      },
 *      "mensagem": {
 *           "ct_mensagem": "conteúdo"
 *       },
 *       "ideia": {
 *           "id_ideia": id_da_ideia
 *       }
 * 
 * @return JSON {msg, token} / JSON {err}
 */
exports.envia_comentario = (req, res) => {

    let id_usuario = req.body.usuario.id_usuario
    let ct_mensagem = req.body.mensagem.ct_mensagem    
    let id_ideia = req.body.ideia.id_ideia
    
    database.query("INSERT INTO tb_mensagem VALUES (default, ?, NOW(), ?, 2, ?)", [ct_mensagem, id_usuario, id_ideia], (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: "Não foi possivel inserir a mensagem"}).end()
        }else{           
            database.query("SELECT nm_usuario FROM tb_usuario WHERE id_usuario = ?", id_usuario, (err2, rows2, fields2) => {
                if(err2){
                    res.status(403).send({err: err2}).end()
                }else{
                    let msg = `${rows2[0].nm_usuario} comentou em uma ideia na qual vc é idealizador`
                    let link = "http://localhost:5500/ideia_chat.html?ideia=" + id_ideia
                    database.query("INSERT INTO tb_notificacao VALUES (?, ?, ?, ?, ?, ?, 2)", [id_usuario, id_ideia, null, rows.insertId, null, msg, link], (err3, rows3, fields3) => {
                        if(err3){
                            return res.status(403).send({err: err3}).end()
                        }else{
                            return res.status(200).send({msg: "ok"}).end()
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
 * @body
 *      "usuario": {
 *          "id_usuario": id_usuario
 *      } 
 *      "comentario":{
 *          "id_mensagem": id_da_mensagem
 *       }
 * 
 * @return JSON {msg, token} // {err}
 */
 
exports.apaga_comentario = (req, res) => {

    let id_usuario = req.body.usuario.id_usuario
    let id_mensagem = req.body.comentario.id_mensagem

    database.query("CALL spDeleta_mensagem(?, ?);", [id_usuario, id_mensagem], (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: err}).end();
        }else{
            if(rows[0][0].msg_erro){
                return res.status(200).send({msg_erro: rows[0][0].msg_erro}).end()
            }else if(rows[0][0].msg_sucesso){   
                database.query("DELETE FROM tb_notificacao WHERE id_comentario = ? AND tp_notificacao = 2", id_mensagem, (err2, rows2, fields2) => {
                    if(err2){
                        return res.status(403).send({err: err2}).end()
                    }else{
                        let newToken = "Bearer " + geraToken({id: id_usuario})
                        return res.status(200).send({
                            msg: "ok",
                            token: newToken
                        }).end()
                    }
                })  
            }

        }
    })
}


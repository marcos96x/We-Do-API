/**
 * Diretório - src/controllers/tecnologias.js
 */

const database = require("../models/database")()
const jwt = require("jsonwebtoken")
const authConfig = require("../../libs/auth")

function geraToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    })
}

/**
 * Busca todas as tecnologias
 * 
 * @param void
 * 
 * @body void
 * 
 * @return JSON {tecnologias} / {err}
 */
exports.busca_tecnologia = (req, res) => {

    database.query("SELECT * FROM tb_tecnologia", (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: "Erro na busca de tecnologias" }).end()
        } else {
            return res.status(200).send({ tecnologias: rows }).end()
        }
    })
}

/**
 * Insere tecnologia no usuário ou apaga se ele já tem ela
 * 
 * @param void
 * 
 * @body "usuario": {
 *          "id_usuario": id_do_usuario
 *       },
 *       "tecnologia":{
 *          "id_tecnologia": id_da_tecnologia
 *       }
 * 
 * @return JSON {msg, token} / {err}
 */
exports.tecnologia_usuario = (req, res) => {

    let id_usuario = req.body.usuario.id_usuario
    let id_tecnologia = req.body.tecnologia.id_tecnologia

    // Verifico se ele já tem ligação
    database.query("SELECT * FROM tecnologia_usuario WHERE id_usuario = ? AND id_tecnologia = ?", [id_usuario, id_tecnologia], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: "Erro na busca das tecnologias" }).end()
        } else {
            if (rows.length == []) {
                // Insere
                database.query("INSERT INTO tecnologia_usuario VALUES (?, ?)", [id_tecnologia, id_usuario], (err2, rows2, fields2) => {
                    if (err2) {
                        return res.status(403).send({ err: "Erro na inserção da tecnologia" }).end()
                    } else {
                        return res.status(200).send({ msg: "Tecnologia adicionada" }).end()
                    }
                })
            } else {
                // Deleta
                database.query("DELETE FROM tecnologia_usuario WHERE id_tecnologia = ? AND id_usuario = ?", [id_tecnologia, id_usuario], (err2, rows2, fields2) => {
                    if (err2) {
                        return res.status(403).send({ err: "Erro na exclusão da tecnologia" }).end()
                    } else {
                        let newToken = "Bearer " + geraToken({ id: id_usuario })
                        return res.status(200).send({ msg: "Tecnologia desvinculada", token: newToken }).end()
                    }
                })
            }
        }
    })
}

/**
 * Insere tecnologia na idéia ou apaga se ela já usa
 * 
 * @param void
 * 
 * @body "ideia": {
 *          "id_ideia": id_da_ideia
 *       },
 *       "usuario": {
 *          "id_usuario": id_do_usuario
 *       },
 *       "tecnologia": {
 *          "id_tecnologia": id_da_tecnologia   
 *       }
 * 
 * @return JSON {msg, token} / {err}
 */
exports.tecnologia_ideia = (req, res) => {

    let id_ideia = req.body.ideia.id_ideia
    let id_tecnologia = req.body.tecnologia.id_tecnologia
    let id_usuario = req.body.usuario.id_usuario

    database.query("SELECT * FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ? AND idealizador = 1", [id_usuario, id_ideia], (err3, rows3, fields3) => {
        if (err3) {
            return res.status(403).send({ err: err3 }).end()
        } else {
            if (rows3.length == []) {
                return res.status(200).send({ msg: "Você não é o idealizador!" }).end()
            } else {
                // Verifico se a ideia já tem ligação
                database.query("SELECT * FROM tecnologia_ideia WHERE id_ideia = ? AND id_tecnologia = ?", [id_ideia, id_tecnologia], (err, rows, fields) => {
                    if (err) {
                        return res.status(403).send({ err: "Erro na busca das tecnologias" }).end()
                    } else {
                        if (rows.length == []) {
                            // Insere
                            database.query("INSERT INTO tecnologia_ideia VALUES (?, ?)", [id_tecnologia, id_ideia], (err2, rows2, fields2) => {
                                if (err2) {
                                    return res.status(403).send({ err: "Erro na inserção da tecnologia" }).end()
                                } else {
                                    return res.status(200).send({ msg: "Tecnologia adicionada" }).end()
                                }
                            })
                        } else {
                            // Deleta
                            database.query("DELETE FROM tecnologia_ideia WHERE id_tecnologia = ? AND id_ideia = ?", [id_tecnologia, id_ideia], (err2, rows2, fields2) => {
                                if (err2) {
                                    return res.status(403).send({ err: "Erro na exclusão da tecnologia" }).end()
                                } else {
                                    return res.status(200).send({ msg: "Tecnologia desvinculada" }).end()
                                }
                            })
                        }
                    }
                })
            }
        }
    })

}
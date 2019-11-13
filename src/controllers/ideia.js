/**
 * Diretorio - src/controllers/ideia.js
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
 * Usuário verá uma ideia na qual ele selecionar
 * 
 * @param id_ideia&id_usuario
 * 
 * @body 
 * 
 * 
 * @return JSON {ideia} / {err}
 */

exports.ver_ideia = (req, res) => {

    let id_ideia = req.params.id_ideia
    let id_usuario = req.params.id_usuario

    database.query("SELECT * FROM tb_ideia WHERE id_ideia = ?", [id_ideia], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: "Não foi possível buscar a ideia" }).end()
        } else {
            if (rows.length == []) {
                return res.status(200).send({ msg: "Ideia não encontrada" }).end()
            } else {
                let ideia = rows[0]
                database.query("SELECT t.id_tecnologia, t.nm_tecnologia FROM tecnologia_ideia AS ti JOIN tb_tecnologia AS t ON t.id_tecnologia = ti.id_tecnologia WHERE ti.id_ideia = ?;", [id_ideia], (err2, rows2, fields2) => {
                    if (err2) {
                        return res.status(403).send({ err: "Não foi possível buscar as tecnologias da ideia" }).end()
                    } else {
                        database.query("SELECT * FROM membros_ideias WHERE id_ideia = ?", [id_ideia], (err3, rows3, fields3) => {
                            if (err3) {
                                return res.status(403).send({ err: err3 }).end()
                            } else {
                                database.query("SELECT m.id_mensagem, m.ct_mensagem, m.id_ideia, u.id_usuario, u.nm_usuario, DATE_ADD(m.hr_mensagem, INTERVAL - 2 HOUR) hr_mensagem FROM tb_mensagem m JOIN tb_usuario u on u.id_usuario = m.id_usuario WHERE uso_mensagem = 2 AND id_ideia = ?", id_ideia, (err4, rows4, fields4) => {
                                    if (err4) {
                                        return res.status(403).send({ err: err4 }).end()
                                    } else {
                                        let comentarios = rows4
                                        database.query("SELECT * FROM curtida_ideia WHERE id_ideia = ?", id_ideia, (err5, rows5, fields5) => {
                                            if (err5) {
                                                return res.status(403).send({ err: "Erro ao buscar quantidade de curtidas" }).end()
                                            } else {
                                                let curtidas = rows5
                                                database.query("SELECT * FROM tb_tag_ideia WHERE id_ideia = ?", id_ideia, (err6, rows6, fields6) => {
                                                    if (err6) {
                                                        return res.status(403).send({ err: err6 }).end()
                                                    } else {
                                                        ideia.tecnologias = rows2
                                                        ideia.membros = rows3
                                                        ideia.comentarios = comentarios
                                                        ideia.curtidas = curtidas
                                                        ideia.tags = rows6

                                                        let newToken = geraToken({ id: id_usuario })
                                                        return res.status(200).send({
                                                            ideia: ideia,
                                                            token: newToken
                                                        }).end()
                                                    }
                                                })

                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }

        }
    })
}

/**
 * Cria uma nova ideia
 * 
 * @param void
 * 
 * @body  "ideia": {
 *             "nm_ideia": "Nome da idéia",
 *             "ds_ideia": "Uma descrição para a idéia",
 *             "tecnologias_ideia": [
 *                   tecnologias_usadas
 *             ],
 *             "tags_ideia": [
 *                   Tags_usadas
 *             ]
 *        },
 *        "usuario": {
 *              "id_usuario": <id_do_usuario>
 *        }
 * 
 * @return JSON {msg, token} / {err}    
 */

exports.cria_ideia = (req, res) => {

    let nm_ideia = req.body.ideia.nm_ideia
    let ds_ideia = req.body.ideia.ds_ideia
    let id_usuario = req.body.usuario.id_usuario
    let tecnologias_ideia = req.body.ideia.tecnologias_ideia
    let tags_ideia = req.body.ideia.tags_ideia

    let sql = "INSERT INTO tb_ideia VALUES (default, "
    sql += "'" + nm_ideia + "', "
    sql += "'" + ds_ideia + "', "
    sql += "curdate(), 0 )"

    database.query(sql, (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: "Erro ao inserir uma nova ideia" }).end()
        } else {
            let id_nova_ideia = rows.insertId
            let count = 0
            let insert = ""
            while (count < tecnologias_ideia.length) {
                if (count == tecnologias_ideia.length - 1)
                    insert += "(" + tecnologias_ideia[count] + ", " + id_nova_ideia + ");                                                            "
                else
                    insert += "(" + tecnologias_ideia[count] + ", " + id_nova_ideia + "), "
                count++
            }
            if (tecnologias_ideia.length != []) {
                database.query("INSERT INTO tecnologia_ideia VALUES " + insert, (err2, rows2, fields2) => {
                    if (err2) {
                        return res.status(403).send({ err: "Nao foi possivel inserir as tecnologias na ideia" }).end()
                    } else {
                        if (tags_ideia.length != []) {
                            let insert2 = ""
                            for (let i = 0; i < tags_ideia.length; i++) {
                                if (i == tags_ideia.length - 1) {
                                    insert2 += "(default, '" + tags_ideia[i] + "', " + id_nova_ideia + ");"
                                }
                                else {
                                    insert2 += "(default, '" + tags_ideia[i] + "', " + id_nova_ideia + "), "
                                }
                            }
                            database.query("INSERT INTO tb_tag_ideia VALUES " + insert2, (err3, rows3, fields3) => {
                                if (err3) {
                                    return res.status(403).send({ err: err3 }).end()
                                } else {
                                    database.query("INSERT INTO participante_ideia VALUES (default, ?, ?, 1, NOW(), 1);", [id_usuario, id_nova_ideia], (err4, rows4, fields4) => {
                                        if (err4) {
                                            return res.status(403).send({ err: err4 }).end()
                                        } else {
                                            let newToken = geraToken({ id: id_usuario })
                                            return res.status(200).send({ msg: "Ok", id_ideia: rows.insertId, token: newToken }).end()
                                        }
                                    })
                                }
                            })
                        } else {
                            database.query("INSERT INTO participante_ideia VALUES (default, ?, ?, 1, NOW(), 1);", [id_usuario, id_nova_ideia], (err4, rows4, fields4) => {
                                if (err4) {
                                    return res.status(403).send({ err: err4 }).end()
                                } else {
                                    let newToken = geraToken({ id: id_usuario })
                                    return res.status(200).send({ msg: "Ok", id_ideia: rows.insertId, token: newToken }).end()
                                }
                            })
                        }
                    }
                })
            } else {
                if (tags_ideia.length != []) {
                    let insert2 = ""
                    for (let i = 0; i < tags_ideia.length; i++) {
                        if (i == tags_ideia.length - 1) {
                            insert2 += "(default, '" + tags_ideia[i] + "', " + id_nova_ideia + ");"
                        }
                        else {
                            insert2 += "(default, '" + tags_ideia[i] + "', " + id_nova_ideia + "), "
                        }
                    }
                    database.query("INSERT INTO tb_tag_ideia VALUES " + insert2, (err3, rows3, fields3) => {
                        if (err3) {
                            return res.status(403).send({ err: err3 }).end()
                        } else {
                            database.query("INSERT INTO participante_ideia VALUES (default, ?, ?, 1, NOW(), 1);", [id_usuario, id_nova_ideia], (err4, rows4, fields4) => {
                                if (err4) {
                                    return res.status(403).send({ err: err4 }).end()
                                } else {
                                    let newToken = geraToken({ id: id_usuario })
                                    return res.status(200).send({ msg: "Ok", id_ideia: rows.insertId, token: newToken }).end()
                                }
                            })
                        }
                    })
                } else {
                    database.query("INSERT INTO participante_ideia VALUES (default, ?, ?, 1, NOW(), 1);", [id_usuario, id_nova_ideia], (err4, rows4, fields4) => {
                        if (err4) {
                            return res.status(403).send({ err: err4 }).end()
                        } else {
                            let newToken = geraToken({ id: id_usuario })
                            return res.status(200).send({ msg: "Ok", id_ideia: rows.insertId, token: newToken }).end()
                        }
                    })
                }
            }


        }
    })
}
/**
 * Remove um usuário de uma ideia / não aceita o convite do mesmo para entrar para a ideia
 * 
 * @param void
 * 
 * @body 
 * "ideia": {
 *      "id_ideia": <id da ideia>,
 *      "id_usuario": <id do criador>
 * },
 * "usuario": {
 *      "id_usuario": <id do usuario>
 * }
 * 
 * @return JSON {msg, token} / {err}
 */
exports.remove_usuario = (req, res) => {

    let id_usuario = req.body.usuario.id_usuario
    let id_ideia = req.body.ideia.id_ideia
    let id_criador = req.body.ideia.id_usuario

    database.query("SELECT * FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ? AND idealizador = 1", [id_criador, id_ideia], (err2, rows2, fields2) => {
        if (err2) {
            res.status(403).send({ err: "Não foi possivel acessar a ideia" }).end()
        } else {
            if (rows2.length == 0) {
                res.status(403).send({ err: "Voce não é o criador da ideia" }).end()
            } else {
                database.query("SELECT id_participacao FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ?", [id_usuario, id_ideia], (err, rows, fields) => {
                    if (err) {
                        res.status(403).send({ err: "Não foi possivel deletar o participante" }).end()
                    } else {
                        id_participacao = rows[0].id_participacao
                        database.query("DELETE FROM tb_notificacao WHERE id_evento = ?", id_participacao, (err3, rows3, fields3) => {
                            if (err3) {
                                return res.status(403).send({ err: err3 }).end()
                            } else {
                                database.query("DELETE FROM participante_ideia WHERE id_participacao = ?", id_participacao, (err4, rows4, fields4) => {
                                    if (err4) {
                                        return res.status(403).send({ err: err4 }).end()
                                    } else {
                                        let newToken = geraToken({ id: id_usuario })
                                        res.status(200).send({ msg: "OK", token: newToken }).end()
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    })
}

/**
 * Aprovar pedidos de solicitação para entrar na idéia
 * 
 * @param void
 * 
 * @body "ideia": {
 *            "id_usuario": <id do criador da ideia>,
 *            "id_ideia": <id_da_ideia>
 *       },
 *       "usuario": {
 *            "id_usuario": <id do solicitante da ideia>
 *       }
 * 
 * @return JSON {msg, token} / {err}
 */
exports.aprova_interesse = (req, res) => {


    let id_usuario = req.body.usuario.id_usuario
    let id_ideia = req.body.ideia.id_ideia
    let id_criador = req.body.ideia.id_usuario
    database.query("SELECT * FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ? AND idealizador = 1", [id_criador, id_ideia], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: err }).end()
        } else {
            if (rows.length == 0) {
                res.status(200).send({ msg: "Você não é o idealizador desta ideia!" }).end()
            } else {
                database.query("SELECT id_participacao FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ?", [id_usuario, id_ideia], (err5, rows5, fields5) => {
                    if (err5) {
                        return res.status(403).send({ err: err5 }).end()
                    } else {
                        database.query("UPDATE participante_ideia SET status_solicitacao = 1 WHERE id_participacao = ?", rows5[0].id_participacao, (err2, rows2, fields2) => {
                            if (err2) {
                                return res.status(403).send({ err: err2 }).end()
                            } else {
                                database.query("SELECT u.nm_usuario, i.nm_ideia FROM tb_usuario u JOIN tb_ideia i ON i.id_ideia = ? WHERE id_usuario = ?", [id_ideia, id_usuario], (err4, rows4, fields4) => {
                                    if (err4) {
                                        return res.status(403).send({ err: err4 }).end()
                                    } else {
                                        let msg = `${rows4[0].nm_usuario} agora faz parte da sua ideia ${rows4[0].nm_ideia}`
                                        let link = "http://localhost:5500/ideia_chat.html?id_ideia=" + id_ideia

                                        database.query("UPDATE tb_notificacao SET msg_notificacao = ?, link_notificacao = ?, tp_notificacao = 4 WHERE id_evento = ? AND tp_notificacao = 3", [msg, link, rows5[0].id_participacao], (err3, rows3, fields3) => {
                                            if (err3) {
                                                return res.status(403).send({ err: err3 }).end()
                                            } else {
                                                return res.status(200).send({ msg: "Ok" }).end()
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })

            }
        }
    })
}

/**
 * Altera dados da ideia
 * 
 * @param void
 * 
 * @body  "ideia": {
 *           "id_ideia": <id da ideia>
 *           "nm_ideia": "<nome da ideia novo>",
 *           "ds_ideia": "<Nova descrição da ideia>",
 *           "status_ideia": "<Novo status da ideia>"
 *        },
 *        "usuario": {
 *          "id_usuario": <id do usuario>
 *        }
 * 
 * @return JSON {msg, token} / {err}
 */

exports.altera_dados = (req, res) => {

    let id_usuario = req.body.usuario.id_usuario
    let id_ideia = req.body.ideia.id_ideia
    let nm_ideia = req.body.ideia.nm_ideia
    let ds_ideia = req.body.ideia.ds_ideia
    let status_ideia = req.body.ideia.status_ideia

    database.query("SELECT id_usuario FROM participante_ideia WHERE id_ideia = ? AND id_usuario = ? AND idealizador = 1", [id_ideia, id_usuario], (err2, rows2, fields2) => {
        if (err2) {
            return res.status(200).send({ err: "Nao foi possivel comparar se voce é o idealizador" }).end()
        } else {
            if (rows2.length != []) {
                if (rows2[0].id_usuario == id_usuario) {
                    database.query("UPDATE tb_ideia SET nm_ideia = ?, ds_ideia = ?, status_ideia = ? WHERE id_ideia = ?", [nm_ideia, ds_ideia, status_ideia, id_ideia], (err, rows, fields) => {
                        if (err) {
                            return res.status(200).send({ err: "Erro ao alterar dados da ideia" }).end()
                        } else {
                            let newToken = geraToken({ id: id_usuario })
                            return res.status(200).send({ msg: "OK", token: newToken }).end()
                        }
                    })
                } else {
                    return res.status(200).send({ err: "Voce não é o idealizador" }).end()
                }
            } else {
                return res.status(200).send({ err: "Voce não é o idealizador" }).end()
            }

        }
    })
}

/**
 * Deleta uma ideia
 * 
 * @param void
 * 
 * @body "ideia": {
 *          "id_ideia": <id da ideia>
 *       },
 *       "usuario": {
 *          "id_usuario": <id do usuario>
 *       }
 * 
 * @return JSON {msg, token} / {err}
 */
exports.deleta_ideia = (req, res) => {

    let id_ideia = req.body.ideia.id_ideia
    let id_usuario = req.body.usuario.id_usuario

    database.query("CALL sp_excluirIdeia(?, ?);", [id_usuario, id_ideia], (err, rows, fields) => {
        if (err) {
            console.log(err)
            return res.status(403).send({ err: err }).end()
        } else {
            return res.status(200).send({ msg: rows[0][0].msg });
        }
    })
}

/**
 * Passa a idéia em questão para um usuário
 * 
 * @param void
 * 
 * @body 
 * "ideia": {
 *      "id_ideia": <id_da_ideia>,
 *      "id_criador": <id_do_criador>
 * },
 * "usuario": {
 *      "id_usuario": <id_do_usuario>
 * }
 * 
 * @return JSON {msg, token} / {err}
 */
exports.passa_ideia = (req, res) => {
    let id_ideia = req.body.ideia.id_ideia
    let id_criador = req.body.ideia.id_criador
    let id_usuario = req.body.usuario.id_usuario

    database.query("SELECT * FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ? AND idealizador = 1", [id_criador, id_ideia], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: err }).end()
        } else {
            if (rows[0].length == 0) {
                // o solicitante não é o idealizador
                return res.status(403).send({ err: "Você não tem permissão para tornar alguem idealizador" }).end()
            } else {
                // o solicitante é o idealizador
                database.query("UPDATE participante_ideia SET idealizador = 0 WHERE id_usuario = ? AND id_ideia = ?", [id_criador, id_ideia], (err2, rows2, fields2) => {
                    if (err2) {
                        return res.status(403).send({ err: err2 }).end()
                    } else {
                        database.query("UPDATE participante_ideia SET idealizador = 1 WHERE id_usuario = ? AND id_ideia = ?", [id_usuario, id_ideia], (err3, rows3, fields3) => {
                            if (err3) {
                                return res.status(403).send({ err: err3 }).end()
                            } else {
                                let newToken = geraToken({ id: id_usuario })
                                return res.status(200).send({ msg: "Ok", token: newToken }).end()
                            }
                        })
                    }
                })
            }
        }
    })
}

/**
 * Usuario pode sair de uma ideia
 * 
 * @params void
 * 
 * @body 
 * "ideia":{
 *      "id_ideia": <id da ideia>
 * },
 * "usuario": {
 *      "id_usuario": <id do usuario>
 * }
 * 
 * @return JSON {msg, token} / {err}
 */
exports.sair_ideia = (req, res) => {
    let id_usuario = req.body.usuario.id_usuario
    let id_ideia = req.body.ideia.id_ideia

    database.query("DELETE FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ?", [id_usuario, id_ideia], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: err }).end()
        } else {
            let newToken = geraToken({ id: id_usuario })
            return res.status(200).send({ msg: "Ok", token: newToken })
        }
    })
}

/**
 *  Usuario verá todas as ideias relacionadas a ele ou a outro usuario que foi terminada
 * 
 * @param id_usuario
 * 
 * @body void
 * 
 * @return JSON {ideias, token} / {err}
 */
exports.portifolio = (req, res) => {

    let id_usuario = req.params.id_usuario

    database.query("SELECT p.id_ideia from participante_ideia p JOIN tb_ideia i ON p.id_ideia = i.id_ideia WHERE p.id_usuario = ? AND p.status_solicitacao = 1 AND i.status_ideia = 2", [id_usuario], (err7, rows7, fields7) => {
        if (err7) {
            return res.status(403).send({ err: "Nao foi possivel pesquisar seu portifólio" }).end()
        } else {

            if(rows7.length != []){
                let count = 0
                let sql = "SELECT * FROM tb_ideia WHERE "
    
                while (count < rows7.length) {
                    if (count == rows7.length - 1)
                        sql += "id_ideia = " + rows7[count].id_ideia
                    else
                        sql += "id_ideia = " + rows7[count].id_ideia + " OR "
                    count++
                }
                database.query(sql, (err, rows, fields) => {
                    if (err) {
                        return res.status(403).send({ err: "Não foi possível buscar a ideia" }).end()
                    } else {
                        if (rows.length == []) {
                            return res.status(200).send({ msg: "Não há ideias concluídas" }).end()
                        } else {
                            let ideias = rows
                            count = 0
                            sql = "SELECT t.id_tecnologia, t.nm_tecnologia FROM tecnologia_ideia AS ti JOIN tb_tecnologia AS t ON t.id_tecnologia = ti.id_tecnologia WHERE "
                            while (count < rows7.length) {
                                if (count == rows7.length - 1)
                                    sql += "ti.id_ideia = " + rows7[count].id_ideia
                                else
                                    sql += "ti.id_ideia = " + rows7[count].id_ideia + " OR "
                                count++
                            }
                            database.query(sql, (err2, rows2, fields2) => {
                                if (err2) {
                                    return res.status(403).send({ err: "Não foi possível buscar as tecnologias da ideia" }).end()
                                } else {
                                    let tecnologias = rows2
                                    sql = "SELECT * FROM membros_ideias WHERE "
                                    count = 0
                                    while (count < rows7.length) {
                                        if (count == rows7.length - 1)
                                            sql += "id_ideia = " + rows7[count].id_ideia
                                        else
                                            sql += "id_ideia = " + rows7[count].id_ideia + " OR "
                                        count++
                                    }
                                    database.query(sql, (err3, rows3, fields3) => {
                                        if (err3) {
                                            return res.status(403).send({ err: err3 }).end()
                                        } else {
                                            count = 0
                                            let membros = rows3
                                            sql = "SELECT m.id_mensagem, m.ct_mensagem, m.id_ideia, u.id_usuario, u.nm_usuario, DATE_ADD(m.hr_mensagem, INTERVAL - 2 HOUR) hr_mensagem FROM tb_mensagem m JOIN tb_usuario u on u.id_usuario = m.id_usuario WHERE uso_mensagem = 2 AND "
                                            while (count < rows7.length) {
                                                if (count == rows7.length - 1)
                                                    sql += "id_ideia = " + rows7[count].id_ideia
                                                else
                                                    sql += "id_ideia = " + rows7[count].id_ideia + " OR "
                                                count++
                                            }
                                            database.query(sql, (err4, rows4, fields4) => {
                                                if (err4) {
                                                    return res.status(403).send({ err: err4 }).end()
                                                } else {
                                                    let comentarios = rows4
                                                    sql = "SELECT * FROM curtida_ideia WHERE "
                                                    count = 0
                                                    while (count < rows7.length) {
                                                        if (count == rows7.length - 1)
                                                            sql += "id_ideia = " + rows7[count].id_ideia
                                                        else
                                                            sql += "id_ideia = " + rows7[count].id_ideia + " OR "
                                                        count++
                                                    }
                                                    database.query(sql, (err5, rows5, fields5) => {
                                                        if (err5) {
                                                            return res.status(403).send({ err: "Erro ao buscar quantidade de curtidas" }).end()
                                                        } else {
                                                            let curtidas = rows5
                                                            for(let i = 0; i < ideias.length; i++){
                                                                ideias[i].tecnologias = []
                                                                ideias[i].membros = []
                                                                ideias[i].comentarios = []
                                                                ideias[i].curtidas = []
                                                                for(let i2 = 0; i2 < tecnologias.length; i2++){
                                                                    if(tecnologias[i2].id_ideia == ideias[i].id_ideia)
                                                                        ideias[i].tecnologias.push(tecnologias[i2])
                                                                }
                                                                for(let i2 = 0; i2 < membros.length; i2++){
                                                                    if(membros[i2].id_ideia == ideias[i].id_ideia)
                                                                        ideias[i].membros.push(membros[i2])
                                                                }
                                                                for(let i2 = 0; i2 < comentarios.length; i2++){
                                                                    if(comentarios[i2].id_ideia == ideias[i].id_ideia)
                                                                        ideias[i].comentarios.push(comentarios[i2])
                                                                }
                                                                for(let i2 = 0; i2 < curtidas.length; i2++){
                                                                    if(curtidas[i2].id_ideia == ideias[i].id_ideia)
                                                                        ideias[i].curtidas.push(curtidas[i2])
                                                                }
                                                            }                   
    
                                                            let newToken = geraToken({ id: id_usuario })
                                                            return res.status(200).send({
                                                                ideias: ideias,
                                                                token: newToken
                                                            }).end()  
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
    
                    }
                })
            }else{
                let newToken = geraToken({ id: id_usuario })
                return res.status(200).send({ideias: [], token: newToken}).end()
            }
            
        }
    })

    //---------------------------------

}

/**
 *  Usuario verá todos seus projetos atuais 
 * 
 * @param id_usuario
 * 
 * @body void
 * 
 * @return JSON {ideias, token} / {err}
 */
exports.projetos_atuais = (req, res) => {

    let id_usuario = req.params.id_usuario

    database.query("SELECT p.id_ideia from participante_ideia p JOIN tb_ideia i ON p.id_ideia = i.id_ideia WHERE p.id_usuario = ? AND p.status_solicitacao = 1 AND i.status_ideia <> 2", [id_usuario], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: "Nao foi possivel pesquisar seu portifólio" }).end()
        } else {
            let count = 0
            let sql = "SELECT * FROM tb_ideia WHERE "
            let sql2 = "SELECT * FROM membros_ideias WHERE "
            let sql3 = "SELECT t.id_tecnologia, t.nm_tecnologia, ti.id_ideia FROM tecnologia_ideia AS ti JOIN tb_tecnologia AS t ON t.id_tecnologia = ti.id_tecnologia WHERE "
            let sql4 = "SELECT * FROM curtida_ideia WHERE "
            let sql5 = "SELECT * FROM mensagens WHERE uso_mensagem = 2 AND "

            while (count < rows.length) {
                if (count == rows.length - 1) {
                    sql += "id_ideia = " + rows[count].id_ideia
                    sql2 += "id_ideia = " + rows[count].id_ideia
                    sql3 += "ti.id_ideia = " + rows[count].id_ideia
                    sql4 += "id_ideia = " + rows[count].id_ideia
                    sql5 += "id_ideia = " + rows[count].id_ideia
                }
                else {
                    sql += "id_ideia = " + rows[count].id_ideia + " OR "
                    sql2 += "id_ideia = " + rows[count].id_ideia + " OR "
                    sql3 += "ti.id_ideia = " + rows[count].id_ideia + " OR "
                    sql4 += "id_ideia = " + rows[count].id_ideia + " OR "
                    sql5 += "id_ideia = " + rows[count].id_ideia + " OR "
                }
                count++
            }
            if (rows.length == []) {
                return res.status(200).send({ msg: "Você não participa de nenhuma ideia" }).end()
            } else {
                database.query(sql, (err2, rows2, fields2) => {
                    if (err2) {
                        return res.status(403).send({ err: "Nao foi possivel pesquisar ideias na qual vc participa" }).end()
                    } else {
                        let ideias_atrelado = rows2
                        database.query(sql2, (err3, rows3, fields3) => {
                            if (err3) {
                                return res.status(403).send({ err: err3 }).end()
                            } else {
                                let membros = rows3
                                database.query(sql3, (err4, rows4, fields4) => {
                                    if (err4) {
                                        return res.status(403).send({ err: err4 }).end()
                                    } else {
                                        let tecnologias = rows4
                                        database.query(sql4, (err5, rows5, fields5) => {
                                            if (err5) {
                                                return res.status(403).send({ err: err5 }).end()
                                            } else {
                                                let curtidas = rows5
                                                database.query(sql5, (err6, rows6, fields6) => {
                                                    if (err6) {
                                                        return res.status(403).send({ err: err6 }).end()
                                                    } else {
                                                        let comentarios = rows6
                                                        for (let i = 0; i < ideias_atrelado.length; i++) {
                                                            ideias_atrelado[i].membros = []
                                                            ideias_atrelado[i].tecnologias = []
                                                            ideias_atrelado[i].comentarios = []
                                                            ideias_atrelado[i].curtidas = []
                                                            for (let i2 = 0; i2 < membros.length; i2++) {
                                                                if (ideias_atrelado[i].id_ideia == membros[i2].id_ideia) {
                                                                    ideias_atrelado[i].membros.push(membros[i2])
                                                                }
                                                            }
                                                            for (let i2 = 0; i2 < tecnologias.length; i2++) {
                                                                if (ideias_atrelado[i].id_ideia == tecnologias[i2].id_ideia) {
                                                                    ideias_atrelado[i].tecnologias.push(tecnologias[i2])
                                                                }
                                                            }
                                                            for (let i2 = 0; i2 < curtidas.length; i2++) {
                                                                if (ideias_atrelado[i].id_ideia == curtidas[i2].id_ideia) {
                                                                    ideias_atrelado[i].curtidas.push(curtidas[i2])
                                                                }
                                                            }
                                                            for (let i2 = 0; i2 < comentarios.length; i2++) {
                                                                if (ideias_atrelado[i].id_ideia == comentarios[i2].id_ideia) {
                                                                    ideias_atrelado[i].comentarios.push(comentarios[i2])
                                                                }
                                                            }
                                                        }



                                                        let newToken = geraToken({ id: id_usuario })
                                                        return res.status(200).send({ ideias: ideias_atrelado, token: newToken }).end()
                                                    }
                                                })
                                            }
                                        })

                                    }
                                })

                            }
                        })

                    }
                })
            }
        }
    })
}

/**
 * Adiciona mais tags à uma ideia
 * 
 * @param void
 * 
 * @body
 * "ideia": {
 *      "id_ideia": <id da ideia>,
 *      "tag_ideia": [todas as tags que deseja incluir]
 * },
 * "usuario": {
 *      "id_usuario": <id do usuario>
 * }
 * 
 * @return JSON {msg, token} / {err}
 */
exports.add_tags = (req, res) => {
    let id_usuario = req.body.usuario.id_usuario
    let id_ideia = req.body.ideia.id_ideia
    let tags_ideia = req.body.ideia.tags_ideia

    database.query("SELECT * FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ? AND idealizador = 1", [id_usuario, id_ideia], (err, rows, fields) => {
        if (err) {

            return res.status(403).send({ err: err }).end()
        } else {
            if (rows[0].length == 0) {
                return res.status(403).send({ err: "Voce não é o idealizador" }).end()
            } else {
                let insert = ""
                for (let i = 0; i < tags_ideia.length; i++) {
                    if (i == tags_ideia.length - 1) {
                        insert += `(default, "${tags_ideia[i]}", ${id_ideia});`
                    }
                    else {
                        insert += `(default, "${tags_ideia[i]}", ${id_ideia}), `
                    }
                }
                let sql = "INSERT INTO tb_tag_ideia VALUES " + insert
                database.query(sql, (err2, rows2, fields2) => {
                    if (err2) {

                        console.log(err2)
                        return res.status(403).send({ err: err2 }).end()
                    } else {
                        let newToken = geraToken({ id: id_usuario })
                        return res.status(200).send({ msg: "Ok", token: newToken }).end()
                    }
                })
            }
        }
    })
}

/**
 * muda o status da ideia 
 * 
 * @param void
 * 
 * @body
 * "ideia": {
 *      "id_ideia": <id da ideia>,
 *      "status_ideia": <novo status da ideia>
 * },
 * "usuario": {
 *      "id_usuario": <id do usuario>
 * }
 * 
 * @return JSON {msg, token} / {err}
 */
exports.muda_status = (req, res) => {
    let id_ideia = req.body.ideia.id_ideia
    let status_ideia = req.body.ideia.status_ideia
    let id_usuario = req.body.usuario.id_usuario

    database.query("SELECT * FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ? AND idealizador = 1", [id_usuario, id_ideia], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: err }).end()
        } else {
            if (rows[0].length == 0) {
                return res.status(401).send({ err: "Você não é um idealizador" }).end()
            } else {
                database.query("UPDATE tb_ideia SET status_ideia = ? WHERE id_ideia = ?", [status_ideia, id_ideia], (err2, rows2, fields2) => {
                    if (err2) {
                        return res.status(403).send({ err: err2 }).end()
                    } else {
                        let newToken = geraToken({ id: id_usuario })
                        return res.status(200).send({ msg: "Ok", token: newToken }).end()
                    }
                })
            }
        }
    })
}

/**
 * Busca por ideias através de palavras chaves
 * 
 * @param busca
 * 
 * @body void
 * 
 * @return JSON {ideias, token} / {err}
 */
exports.buscar_nome = (req, res) => {
    let busca = req.params.nome

    database.query("CALL spBusca_ideias_nome(?)", [busca], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: err }).end()
        } else {
            return res.status(200).send({ ideias: rows[0] }).end()
        }
    })
}

/**
 * Busca por ideias através de tecnologias
 * 
 * @param tecnologia
 * 
 * @body void
 * 
 * @return JSON {ideias, token} / {err}
 */
exports.buscar_tecnologias = (req, res) => {
    let tecnologia = req.params.tecnologia

    database.query("CALL spBusca_ideias_tecnologia(?)", [tecnologia], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: err }).end()
        } else {
            return res.status(200).send({ ideias: rows[0] }).end()
        }
    })
}

/**
 * Busca por ideias através de tecnologias e nome
 * 
 * @param tecnologia, nome
 * 
 * @body void
 * 
 * @return JSON {ideias, token} / {err}
 */
exports.buscar_tecnologias_nome = (req, res) => {
    let tecnologia = req.params.tecnologia
    let busca = req.params.nome

    database.query("CALL spBusca_ideias_nome_tecnologia(?, ?)", [tecnologia, busca], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: err }).end()
        } else {
            return res.status(200).send({ ideias: rows[0] }).end()
        }
    })
}

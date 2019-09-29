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
            let ideia = rows[0]
            database.query("SELECT t.id_tecnologia, t.nm_tecnologia FROM tecnologia_ideia AS ti JOIN tb_tecnologia AS t ON t.id_tecnologia = ti.id_tecnologia WHERE ti.id_ideia = ?;", [id_ideia], (err2, rows2, fields2) => {
                if (err2) {
                    return res.status(403).send({ err: "Não foi possível buscar as tecnologias da ideia" }).end()
                } else {
                    database.query("SELECT * FROM membros_ideias WHERE id_ideia = ?", [id_ideia], (err3, rows3, fields3) => {
                        if (err3) {
                            return res.status(403).send({ err: err3 }).end()
                        } else {
                            database.query("SELECT * FROM mensagens WHERE uso_mensagem = 2 AND id_ideia = ?", id_ideia, (err4, rows4, fields4) => {
                                if (err4) {
                                    return res.status(403).send({ err: err4 }).end()
                                } else {
                                    let comentarios = rows4[0]
                                    database.query("SELECT * FROM curtida_ideia WHERE id_ideia = ?", id_ideia, (err5, rows5, fields5) => {
                                        if (err5) {
                                            return res.status(403).send({ err: "Erro ao buscar quantidade de curtidas" }).end()
                                        } else {
                                            let curtidas = rows5

                                            ideia.tecnologia = rows2
                                            ideia.membros = rows3
                                            ideia.comentarios = comentarios
                                            ideia.curtidas = curtidas

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
            return res.status(403).send({ err: "Erro ao inserir uma nova idéia" }).end()
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

            database.query("INSERT INTO tecnologia_ideia VALUES " + insert, (err2, rows2, fields2) => {
                if (err2) {
                    return res.status(403).send({ err: "Nao foi possivel inserir as tecnologias na ideia" }).end()
                } else {
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
                            database.query("INSERT INTO participante_ideia VALUES (?, ?, 1, NOW(), 1);", [id_usuario, id_nova_ideia], (err4, rows4, fields4) => {
                                if (err4) {
                                    return res.status(403).send({ err: err4 }).end()
                                } else {
                                    let newToken = geraToken({ id: id_usuario })
                                    return res.status(200).send({ msg: "Ok", token: newToken }).end()
                                }
                            })
                        }
                    })
                }
            })
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
    let id_criador = req.body.usuario.id_usuario

    database.query("SELECT * FROM tb_ideia WHERE id_usuario = ? AND id_ideia = ?", [id_criador, id_ideia], (err2, rows2, fields2) => {
        if (err2) {
            return res.status(403).send({ err: "Não foi possivel acessar a ideia" }).end()
        } else {
            if (rows2.length == 0) {
                return res.status(403).send({ err: "Voce não é o criador da ideia" }).end()
            } else {
                database.query("UPDATE participante_ideia SET status_solicitacao = 1 WHERE id_usuario = ? AND id_ideia = ?", [id_usuario, id_ideia], (err, rows, fields) => {
                    if (err) {
                        return res.status(403).send({ err: "Não foi possivel aceitar o participante" }).end()
                    } else {
                        let newToken = geraToken({ id: id_criador })
                        return res.status(200).send({ msg: "OK", token: newToken }).end()
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

    database.query("SELECT id_usuario FROM tb_ideia WHERE id_ideia = ?", id_ideia, (err2, rows2, fields2) => {
        if (err2) {
            return res.status(403).send({ err: "Nao foi possivel comparar se voce é o idealizador" }).end()
        } else {
            if (rows2[0].id_usuario == id_usuario) {
                database.query("UPDATE tb_ideia SET nm_ideia = ?, ds_ideia = ?, status_ideia = ? WHERE id_ideia = ?", [nm_ideia, ds_ideia, status_ideia, id_ideia], (err, rows, fields) => {
                    if (err) {
                        return res.status(403).send({ err: "Erro ao alterar dados da ideia" }).end()
                    } else {
                        let newToken = geraToken({ id: id_usuario })
                        return res.status(200).send({ msg: "OK", token: newToken }).end()
                    }
                })
            } else {
                return res.status(401).send({ err: "Voce não é o idealizador" }).end()
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

    database.query("SELECT id_ideia from participante_ideia WHERE id_usuario = ?", [id_usuario], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: "Nao foi possivel pesquisar seu portifólio" }).end()
        } else {
            let count = 0
            let sql = "SELECT * FROM tb_ideia WHERE status_ideia = 2 AND "

            while (count < rows.length) {
                if (count == rows.length - 1)
                    sql += "id_ideia = " + rows[count].id_ideia
                else
                    sql += "id_ideia = " + rows[count].id_ideia + " OR "
                count++
            }
            database.query(sql, (err2, rows2, fields2) => {
                if (err2) {
                    return res.status(403).send({ err: "Nao foi possivel pesquisar ideias na qual vc participa" }).end()
                } else {
                    let ideias_atrelado = rows2
                    let newToken = geraToken({ id: id_usuario })
                    return res.status(200).send({ ideias: ideias_atrelado, token: newToken }).end()
                }
            })
        }
    })
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

    database.query("SELECT id_ideia from participante_ideia WHERE id_usuario = ?", [id_usuario], (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: "Nao foi possivel pesquisar seu portifólio" }).end()
        } else {
            let count = 0
            let sql = "SELECT * FROM tb_ideia WHERE status_ideia <> 2 AND "
            let sql2 = "SELECT * FROM membros_ideias WHERE "

            while (count < rows.length) {
                if (count == rows.length - 1) {
                    sql += "id_ideia = " + rows[count].id_ideia
                    sql2 += "id_ideia = " + rows[count].id_ideia
                }
                else {
                    sql += "id_ideia = " + rows[count].id_ideia + " OR "
                    sql2 += "id_ideia = " + rows[count].id_ideia + " OR "
                }
                count++
            }
            if(rows.length == []){
                return res.status(200).send({msg: "Você não participa de nenhuma ideia"}).end()
            }else{
                database.query(sql, (err2, rows2, fields2) => {
                    if (err2) {
                        return res.status(403).send({ err: "Nao foi possivel pesquisar ideias na qual vc participa" }).end()
                    } else {
                        let ideias_atrelado = rows2
                        database.query(sql2, (err3, rows3, fields3) => {
                            if(err3){
                                return res.status(403).send({err: err3}).end()
                            }else{
                                let membros = rows3
                                for(let i = 0; i < ideias_atrelado.length; i++){
                                    ideias_atrelado[i].membros = []
                                    for(let i2 = 0; i2 < membros.length; i2++){
                                        if(ideias_atrelado[i].id_ideia == membros[i2].id_ideia){
                                            ideias_atrelado[i].membros.push(membros[i2])
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
 *      "id_criador": <id do criador>
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
    let id_criador = req.body.ideia.id_criador

    database.query("SELECT * FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ? AND idealizador = 1", [id_criador, id_ideia], (err2, rows2, fields2) => {
        if (err2) {
            res.status(403).send({ err: "Não foi possivel acessar a ideia" }).end()
        } else {
            if (rows2.length == 0) {
                res.status(403).send({ err: "Voce não é o criador da ideia" }).end()
            } else {
                database.query("DELETE FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ?", [id_usuario, id_ideia], (err, rows, fields) => {
                    if (err) {
                        res.status(403).send({ err: "Não foi possivel deletar o participante" }).end()
                    } else {
                        let newToken = geraToken({ id: id_usuario })
                        res.status(200).send({ msg: "OK", token: newToken }).end()
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
 *      "tags_ideia": [todas as tags que deseja incluir]
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
                let insert
                for (let i = 0; i < tags_ideia.length; i++) {
                    if (i == tags_ideia.length - 1) {
                        insert += "(default, " + tags_ideia[i] + ", " + id_ideia + ");"
                    }
                    else {
                        insert += "(default, " + tags_ideia[i] + ", " + id_ideia + "), "
                    }
                }
                database.query("INSERT INTO tb_tag_ideia VALUES " + insert, (err2, rows2, fields2) => {
                    if (err2) {
                        return res.status(403).send({ err: err }).end()
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
                        return res.status(403).send({ err: err }).end()
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

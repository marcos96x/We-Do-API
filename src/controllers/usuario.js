/**
 * Diretório - ./src/controllers/usuario.js
 */

const database = require("../models/database")()
const jwt = require("jsonwebtoken")
const authConfig = require("../../libs/auth")
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer')

function geraToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    })
}

function envia_email(destinatario, token, nome) {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        port: 587,
        secure: false,

        auth: {
            user: "wedo.suporte@gmail.com",
            pass: "tcc2019wedo"
        },
        tls: { rejectUnauthorized: false }
    })

    var handlebars = require('handlebars');
    var fs = require('fs');

    var readHTMLFile = function (path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
            if (err) {
                throw err;
                callback(err);
            }
            else {
                callback(null, html);
            }
        });
    };
    let link = "http://127.0.0.1:5500/index.html?token=" + token
    readHTMLFile(__dirname + '/../../public/email.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            link_token: link
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: 'wedo.suporte@gmail.com',
            to: destinatario,
            subject: 'Verificação de email - We Do',
            html: htmlToSend
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return error
            } else {
                return info
            }
        });
    });
}

function envia_email_recupera_senha(destinatario, token, nome) {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        port: 587,
        secure: false,

        auth: {
            user: "wedo.suporte@gmail.com",
            pass: "tcc2019wedo"
        },
        tls: { rejectUnauthorized: false }
    })

    var handlebars = require('handlebars');
    var fs = require('fs');

    var readHTMLFile = function (path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
            if (err) {
                throw err;
                callback(err);
            }
            else {
                callback(null, html);
            }
        });
    };
    let link = "http://127.0.0.1:5500/recupera_senha.html?token=" + token
    readHTMLFile(__dirname + '/../../public/email_recupera_senha.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
            link_token: link
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: 'wedo.suporte@gmail.com',
            to: destinatario,
            subject: 'Recuperar senha - We Do',
            html: htmlToSend
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return error
            } else {
                return info
            }
        });
    });
}

exports.valida_conta = (req, res) => {
    let token = req.body.token
    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            res.status(203).send({ err: err }).end()
        } else {
            let id_usuario = decoded.id
            database.query("UPDATE tb_usuario SET status_usuario = 1 WHERE id_usuario = ?;", id_usuario, (err, rows, fields) => {
                if (err) {
                    return res.status(200).send({ err: err }).end()
                } else {
                    return res.status(200).send({ msg: "Conta confirmada com sucesso!" }).end()
                }
            })
        }
    })
}

exports.pega_id_do_token = (req, res) => {
    let token = req.body.token
    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            res.status(203).send({ err: err }).end()
        } else {
            let id_usuario = decoded.id            
            return res.status(200).send({ id_usuario: id_usuario}).end()                
        }
    })
}

/**
* Realiza o cadastro do usuário
* 
* @param void
* 
* @body 
*  usuario : {
*     email_usuario: "email",
*     senha_usuario: "senha",
*     nm_usuario : "nome",
*     dt_nascimento: "data de nascimento",
*     tecnologias_usuario: [
*         1, 
*         2, 
*         3, 
*         5, 
*         7
*     ]   
* }
* 
* @return JSON {msg} / {err}
*/
exports.cadastro = (req, res) => {
    // Verificação se já existe o email que se quer cadastrar
    database.query("SELECT * FROM tb_usuario WHERE email_usuario = '" + req.body.usuario.email_usuario + "'", (err, rows, fields) => {
        if (err) {
            return res.status(200).send({ err: err }).end()
        } else {
            if (rows.length == []) {
                bcrypt.hash(req.body.usuario.senha_usuario, 10, (err, hash) => {
                    //cadastra primeiro o usuario
                    if (err) {
                        return res.send({ err: "Erro ao tentar criptografar senha" }).end()
                    } else {
                        let dados_usuario = [
                            "default",
                            "'" + req.body.usuario.email_usuario + "'",
                            "'" + hash + "'",
                            "'" + req.body.usuario.nm_usuario + "'",
                            "'" + req.body.usuario.dt_nascimento + "'",
                            "null",
                            "null",
                            "curdate()",
                            0
                        ]

                        database.query("INSERT INTO tb_usuario VALUES (" + dados_usuario + ")", (err2, rows2, fields2) => {
                            if (err2) {
                                return res.status(200).send({ err: err }).end()
                            } else {
                                // Cadastro OK
                                // Liga as tecnologias com o usuario
                                // Guarda todas as tecnologias em uma variavel
                                let count = 0
                                let insert = ""
                                if (req.body.usuario.tecnologias_usuario.length > 0) {
                                    while (count < req.body.usuario.tecnologias_usuario.length) {
                                        if (count == req.body.usuario.tecnologias_usuario.length - 1) // req.body.usuario.tecnologias_usuario[count] 
                                            insert += "(" + req.body.usuario.tecnologias_usuario[count] + ", " + rows2.insertId + ") "
                                        else
                                            insert += "(" + req.body.usuario.tecnologias_usuario[count] + ", " + rows2.insertId + "), "

                                        count++
                                    }

                                    database.query("INSERT INTO tecnologia_usuario VALUES " + insert, (err3, rows3, fields3) => {
                                        if (err3) {
                                            return res.status(200).send({ err: "Não foi possível cadastrar as tecnologias" }).end()
                                        } else {
                                            let newToken = geraToken({ id: rows2.insertId })
                                            let send = envia_email(req.body.usuario.email_usuario, newToken, req.body.usuario.nm_usuario)
                                            return res.status(200).send({ msg: "Email enviado! Favor confirmar endereço de email!" }).end()
                                        }
                                    })
                                } else {
                                    let newToken = geraToken({ id: rows2.insertId })
                                    let send = envia_email(req.body.usuario.email_usuario, newToken, req.body.usuario.nm_usuario)
                                    return res.status(200).send({ msg: "Email enviado! Favor confirmar endereço de email!" }).end()


                                }

                            }
                        })
                    }
                });
            } else {
                return res.status(200).send({ err: "Este email já está em uso" }).end()
            }
        }
    })
}

/**
 * Realiza o login do usuário
 * 
 * @param void
 * 
 * @body
 * "usuario": {
 *      "email_usuario": "<Email do usuario>"
 *      "senha_usuario": "<Senha do usuario>"
 *  }
 * 
 * @return JSON {usuario, token} / {err}
 */
exports.login = (req, res) => {
    // Verifica se o email ta certo, senha está certo e se o usuario está apto para logar (status == 1)
    database.query("SELECT * FROM tb_usuario WHERE email_usuario = '" + req.body.usuario.email_usuario + "'", (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: err }).end()
        } else {
            if (rows.length != []) {
                if (req.body.usuario.email_usuario == rows[0].email_usuario) {
                    // Verifica a senha
                    let password = req.body.usuario.senha_usuario
                    bcrypt.compare(password, rows[0].senha_usuario)
                        .then((result) => {
                            if (!result) {
                                return res.status(200).send({ err: "Senha incorreta! Por favor, tente novamente" }).end()
                            } else {
                                if (rows[0].status_usuario == 0) {
                                    return res.status(200).send({ err: "Você precisa verificar seu email!" }).end()
                                } else {
                                    //Loga
                                    let newToken = "Bearer " + geraToken({ "id": rows[0].id_usuario })

                                    return res.status(200).send({
                                        usuario: {
                                            id_usuario: rows[0].id_usuario,
                                            nm_usuario: rows[0].nm_usuario,
                                        },
                                        token: newToken
                                    }).end()

                                }
                            }
                        });
                } else {
                    return res.status(200).send({ err: "Usuario não encontrado" }).end()
                }
            } else {
                return res.status(200).send({ err: "Usuario não encontrado" }).end()
            }
        }


    })
}


/**
 *  Recuperação de senha
 *  Manda email para confirmar alteração de senha no site web
 *  
 * @param void
 * 
 * @body 
 * usuario: {
 *      "email_usuario": "<email do usuario>"
 * }
 * 
 * @return link para troca de email
 */
exports.recupera_senha = (req, res) => {

    let email = req.body.usuario.email_usuario
    database.query("SELECT * FROM tb_usuario WHERE email_usuario = ?", email, (err, rows, fields) => {
        if (err) {
            return res.status(200).send({ err: "Erro de busca no email" }).end()
        } else {
            if (rows.length == []) {
                return res.status(200).send({ err: "Email não registrado" }).end()
            } else {
                // envia email                
                let newToken = geraToken({ id: rows[0].id_usuario })
                // envia um email
                let send = envia_email_recupera_senha(req.body.usuario.email_usuario, newToken, rows[0].nm_usuario)
                return res.send({msg: "Email enviado! Favor verificar sua caixa de entrada!"}).end()
            }
        }
    })
}

exports.troca_senha_recuperacao = (req, res) => {

    let id_usuario = req.body.usuario.id_usuario
    let senha_nova = req.body.usuario.senha_nova

    bcrypt.hash(senha_nova, 10, (errh, hash) => {
        if(errh){
            return res.status(402).send({err: errh}).end()
        }else{
            database.query("UPDATE tb_usuario SET senha_usuario = ? WHERE id_usuario = ?", [hash, id_usuario], (err2, rows2, fields2) => {
                if(err2){
                    return res.status(403).send({err: err2}).end()
                }else{
                    let newToken = geraToken({ "id": id_usuario })
                    return res.status(200).send({
                        msg: "Ok",
                        token: newToken
                    }).end()
                }
            })
        }
    })
}

/**
 * Faz a troca exclusivamente da senha
 * 
 * @param id_usuario
 * 
 * @body 
 * "usuario": {
 *      "senha_antiga": "<Antiga senha do usuário>",
 *      "senha_nova": "<nova senha do usuario"
 * }
 * 
 * @return JSON{msg, token} / {err}
 */
exports.troca_senha = (req, res) => {

    let senha_nova = req.body.usuario.senha_nova
    let senha_antiga = req.body.usuario.senha_antiga
    let id_usuario = req.params.id_usuario

    database.query("SELECT * FROM tb_usuario WHERE id_usuario = ?", id_usuario, (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: err}).end()
        }else{
            bcrypt.compare(senha_antiga, rows[0].senha_usuario)
                .then((result) => {
                    if (!result) {
                        return res.status(200).send({ err: "Senha incorreta! Por favor, tente novamente" }).end()
                    } else {
                        bcrypt.hash(senha_nova, 10, (errh, hash) => {
                            if(errh){
                                return res.status(402).send({err: errh}).end()
                            }else{
                                database.query("UPDATE tb_usuario SET senha_usuario = ? WHERE id_usuario = ?", [hash, id_usuario], (err2, rows2, fields2) => {
                                    if(err2){
                                        return res.status(403).send({err: err2}).end()
                                    }else{
                                        let newToken = geraToken({ "id": id_usuario })
                                        return res.status(200).send({
                                            msg: "Ok",
                                            token: newToken
                                        }).end()
                                    }
                                })
                            }
                        })                               
                    }
                });
        }
    })
}

/**
 * Atualiza os dados do usuário (usado em qualquer alteração)
 * 
 * @param id_usuario
 * 
 * @body {usuario, tecnologias}
 * 
 * @return JSON {msg} / {err}
 * 
 */
exports.atualiza_dados = (req, res) => {
    database.query("UPDATE tb_usuario SET ? WHERE id_usuario = ? ", [req.body.usuario, req.params.id_usuario], (err, rows, fields) => {
        if (err) {
            return res.status(200).send({ err: err }).end()
        } else {
            // altera tecnologias
            database.query("DELETE FROM tecnologia_usuario WHERE id_usuario = ?", req.params.id_usuario, (err2, rows2, fields2) => {
                if(err2){
                    return res.status(403).send({err: err2}).end()
                }else{
                    if(req.body.tecnologias.length > 0){
                        let sql = "INSERT INTO tecnologia_usuario VALUES "

                        for(let i = 0; i < req.body.tecnologias.length; i++){
                            if(i == req.body.tecnologias.length - 1){
                                sql += `(${req.body.tecnologias[i]}, ${req.params.id_usuario});`
                            }else{
                                sql += `(${req.body.tecnologias[i]}, ${req.params.id_usuario}), `
                            }
                        }

                        database.query(sql, (err3, rows3, fields3) => {
                            if(err3){
                                return res.status(403).send({err: err3}).end()
                            }else{
                                return res.status(200).send({ msg: "Dados alterados com sucesso!" }).end()
                            }
                        })
                    }else{
                        return res.status(200).send({ msg: "Dados alterados com sucesso!" }).end()
                    }
                }
            })
        }
    })
}

/**
 * Usuário denunciar outro usuário
 * 
 * @param void
 * 
 * @body
 * "denuncia": {
 *      "descricao_denuncia": "descricao",
 *      "id_usuario_acusador": id,
 *      "id_usuario_denunciado": id
 * }
 * 
 * @return JSON {msg} / {err}
 */

exports.denuncia = (req, res) => {
    let desc = req.body.denuncia.descricao_denuncia
    let acusador = req.body.denuncia.id_usuario_acusador
    let denunciado = req.body.denuncia.id_usuario_denunciado


    // Saber se ja teve denuncia

    database.query("SELECT * FROM tb_denuncia WHERE id_usuario_acusador = ? AND id_usuario_denunciado = ?", [acusador, denunciado], (err, rows, fields) => {
        if (err) {
            return res.status(200).send({ err: "Erro na busca das denuncias" }).end()
        } else {
            if (rows.length == []) {
                // Efetua a denuncia                 
                database.query("INSERT INTO tb_denuncia (desc_denuncia, id_usuario_acusador, id_usuario_denunciado) VALUES (?, ?, ?)", [desc, acusador, denunciado], (err2, rows2, fields2) => {
                    if (err2) {
                        return res.status(200).send({ err: err2 }).end()
                    } else {
                        return res.status(200).send({ msg: 1 }).end()
                    }
                })
            } else {
                // Retira a denuncia
                database.query("DELETE FROM tb_denuncia WHERE id_usuario_acusador = ? AND id_usuario_denunciado = ?", [acusador, denunciado], (err3, rows3, fields3) => {
                    if (err3) {
                        return res.status(200).send({ err: "Erro na retirada da denuncia" }).end()
                    } else {
                        return res.status(200).send({ msg: 2}).end()
                    }
                })
            }
        }
    })

}

/** 
 * Mostra os dados do usuário
 * 
 * @param id_usuario, id_usuario_pesquisado
 * 
 * @body void
 * 
 * @return JSON {perfil_usuario, token} / {err}
*/
exports.perfil = (req, res) => {

    database.query("SELECT id_usuario, nm_usuario, email_usuario, ds_bio, sfMascara_telefone(tel_usuario) tel_usuario, dt_nascimento FROM tb_usuario WHERE id_usuario = ?", req.params.id_usuario_pesquisado, (err, rows, fields) => {
        if (err) {
            return res.status(403).send({ err: err }).end()
        } else {
            database.query("SELECT t.id_tecnologia, t.nm_tecnologia FROM tb_tecnologia t JOIN tecnologia_usuario te on te.id_tecnologia = t.id_tecnologia WHERE te.id_usuario = ?", req.params.id_usuario_pesquisado, (err2, rows2, fields2) => {
                if (err2) {
                    return res.status(403).send({ err: err2 }).end()
                } else {

                    let perfil_usuario = rows[0]
                    perfil_usuario.tecnologias = rows2

                    let newToken = geraToken({ "id": req.params.id_usuario })
                    return res.status(200).send({
                        perfil_usuario: perfil_usuario,
                        token: newToken
                    }).end()
                }
            })
        }
    })
}

/**
 * Deleta o usuário
 * 
 * @param void
 * 
 * @body 
 * "usuario": {
 *      "id_usuario": id
 * }
 * 
 * @return JSON {msg} / {err}
 */
exports.deleta = (req, res) => {
    let id = req.body.usuario.id_usuario

    // saber quais as ideias na qual o usuario é idealizador
    database.query("SELECT * FROM participante_ideia WHERE id_usuario = ? AND idealizador = 1", id, (err, rows, fields) => {
        if (err) {
            return res.status(200).send({ err: err }).end()
        } else {
            let ideias_idealizador = rows
            if(ideias_idealizador.length > 0){
                //remove todos os usuarios destas ideias
                let sql = "DELETE FROM participante_ideia WHERE "
                for(let i = 0; i < ideias_idealizador.length; i++){
                    if(i == ideias_idealizador.length - 1){
                        sql += "id_ideia = " + ideias_idealizador[i].id_ideia
                    }else{
                        sql += "id_ideia = " + ideias_idealizador[i].id_ideia + " OR "
                    }
                }

                database.query(sql, (err2, rows2, fields2) => {
                    if(err2){
                        return res.status(403).send({err: err2}).end()
                    }else{
                        sql = "DELETE FROM tb_ideia WHERE "
                        for(let i = 0; i < ideias_idealizador.length; i++){
                            if(i == ideias_idealizador.length - 1){
                                sql += "id_ideia = " + ideias_idealizador[i].id_ideia
                            }else{
                                sql += "id_ideia = " + ideias_idealizador[i].id_ideia + " OR "
                            }
                        }
                        database.query(sql, (err3, rows3, fields3) => {
                            if(err3){
                                return res.status(403).send({err: err3}).end()
                            }else{
                                database.query("CALL spDeleta_usuario(?);", id, (err4, rows4, fields4) => {
                                    if(err4){
                                        return res.status(403).send({err: err4}).end()
                                    }else{
                                        return res.status(200).send({msg: "Ok"}).end()
                                    }
                                })
                            }
                        })
                    }
                })                
            }else{
                database.query("DELETE FROM participante_ideia WHERE id_usuario = ?", id, (err2, rows2, fields2) => {
                    if(err2){
                        return res.status(403).send({err: err2}).end()
                    }else{
                        database.query("CALL spDeleta_usuario(?);", id, (err3, rows3, fields3) => {
                            if(err3){
                                return res.status(403).send({err: err3}).end()
                            }else{
                                return res.status(200).send({msg: "Ok"}).end()
                            }
                        })
                    }
                })
            }
           
        }
    })
}
/**
 * Diretorio - src/controllers/feed.js
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
 * Realiza o ato do interesse da ideia, enviando caso ele não tenha enviado antes, e cancelando caso ele já enviou
 * 
 * @param void
 * 
 * @body "usuario": {
 *          "id_usuario": id_do_usuario
 *       },
 *       "ideia": {
 *          "id_ideia": id_da_ideia
 *       }
 * 
 * @return JSON {msg, token} / {err}
 */

exports.interesse = (req, res) => {

    let id_usuario = req.body.usuario.id_usuario
    let id_ideia = req.body.ideia.id_ideia

    database.query("SELECT * FROM participante_ideia WHERE id_usuario = ? AND id_ideia = ?", [id_usuario, id_ideia], (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: "Erro ao buscar interesses da ideia"}).end()
        }else{
            if(rows.length == []){
                // insere
                database.query("INSERT INTO participante_ideia VALUES (default, ?, ?, 0, NOW(), 0)", [id_usuario, id_ideia], (err2, rows2, fields2) => {
                    if(err2){
                        return res.status(403).send({err: "Erro ao solicitar interesse na ideia"}).end()
                    }else{
                        database.query("SELECT nm_usuario FROM tb_usuario WHERE id_usuario = ?", [id_usuario], (err3, rows3, fields3) => {
                            if(err3){
                                res.status(403).send({err: err3}).end()
                            }else{
                                let msg = `${rows3[0].nm_usuario} comentou em uma ideia na qual vc é idealizador`
                                let link = "http://localhost:5500/ideia_chat.html?ideia=" + id_ideia
                                database.query("INSERT INTO tb_notificacao VALUES (?, ?, ?, ?)", [id_usuario, id_ideia, msg, link], (err4, rows4, fields4) => {
                                    if(err4){
                                        return res.status(403).send({err: err4}).end()
                                    }else{
                                        return res.status(200).send({msg: "ok"}).end()
                                    }
                                })
                            }
                        })
                    }
                })                
            }else{
                // Deleta
                database.query("DELETE FROM participante_ideia WHERE id_ideia = ? AND id_usuario = ?", [id_ideia, id_usuario], (err2, rows2, fields2) => {
                    if(err2){
                        return res.status(403).send({err: "Erro ao deletar o interesse"}).end()
                    }else{
                        database.query("DELETE FROM tb_notificacao WHERE ")
                        let newToken = geraToken({id: id_usuario})
                        return res.status(200).send({msg: "Cancelou", token: newToken}).end()
                    }
                })
            }
        }
    })
}

/**
 * Realiza o ato da curtida, curtindo caso o usuario não curtiu e descurtindo caso ele já curtiu
 * 
 * @params void
 * 
 * @body "usuario": {
 *          "id_usuario": id_do_usuario
 *       },
 *       "ideia": {
 *          "id_ideia": id_da_ideia
 *       }
 * 
 * @return JSON {msg, token} / {err}
 */
exports.curtida = (req, res) => {

    let id_usuario = req.body.usuario.id_usuario
    let id_ideia = req.body.ideia.id_ideia

    database.query("SELECT * FROM curtida_ideia WHERE id_usuario = ? AND id_ideia = ?", [id_usuario, id_ideia], (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: "Erro ao buscar curtidas"}).end()
        }else{
            if(rows.length == []){
                // insere
                database.query("INSERT INTO curtida_ideia VALUES (default, ?, ?, NOW())", [id_ideia, id_usuario], (err2, rows2, fields2) => {
                    if(err2){
                        return res.status(403).send({err: "Erro ao curtir a ideia"}).end()
                    }else{
                        database.query("SELECT nm_usuario FROM tb_usuario WHERE id_usuario = ?", [id_usuario], (err3, rows3, fields3) => {
                            if(err3){
                                res.status(403).send({err: err3}).end()
                            }else{
                                let msg = `${rows3[0].nm_usuario} curtiu uma ideia na qual vc é idealizador`
                                let link = "http://localhost:5500/ideia_chat.html?ideia=" + id_ideia
                                database.query("INSERT INTO tb_notificacao VALUES (?, ?, ?, ?)", [id_usuario, id_ideia, msg, link], (err3, rows3, fields3) => {
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
            }else{
                // Deleta
                database.query("DELETE FROM curtida_ideia WHERE id_ideia = ? AND id_usuario = ?", [id_ideia, id_usuario], (err2, rows2, fields2) => {
                    if(err2){
                        return res.status(403).send({err: "Erro ao deletar a curtida"}).end()
                    }else{
                        let newToken = geraToken({id: id_usuario})
                        return res.status(200).send({msg: "descurtiu", token: newToken}).end()
                    }
                })
            }
        }
    })
}

/**
 * Mostra as ideias que aparecerá no feed do usuário
 * 
 * @param id_usuario
 * 
 * @body void
 * 
 * @return JSON {ideias, token} / {err}
 */
exports.feed = (req, res) => {

    let id_usuario = req.params.id_usuario
    database.query("SELECT * FROM tb_usuario WHERE id_usuario = ?", id_usuario, (err8, rows8, fields8) => {
        if(err8){
            return res.status(403).send({err: err8}).end()
        }else{
            if(rows8.length == []){
                return res.status(404).send({err: "Usuário não encontrado"}).end()
            }else{
                // Saber todas as tecnologias que o usuario gosta
                database.query("SELECT id_tecnologia FROM tecnologia_usuario WHERE id_usuario = ?", id_usuario, (err, rows, fields) => {
                    if(err){
                        return res.status(403).send({err: "Erro ao buscar tecnologias do usuario"}).end()
                    }else{
                    let count = 0
                    // Guarda as tecnologias que o usuario gosta
                    let tecnologias = []
                    // Insere em tecnologias todas as tecnologias referente ao usuario
                    if(rows.length == []){
                        // exibe o feed com todas as ideias
                        database.query("SELECT * FROM tb_ideia", (err3, rows3, fields3) => {
                            if(err3){
                                return res.status(403).send({err: err3}).end()
                            }else{
                                // Guarda os dados das ideias que tem tecnologias que o usuario tem interesse
                                let ideias_pesquisadas = rows3
                                if(ideias_pesquisadas.length == []){
                                    // Caso não tenha ideias
                                    return res.status(200).send({ideias: ideias_pesquisadas}).end()
                                }else{
                                    // Caso tenha ideias, pesquisar os usuários que fazem parte destas ideias
                                    // query para pegar participantes
                                    sql = "SELECT * FROM membros_ideias WHERE "                                
                                    // query para pegar quantidade de curtidas
                                    let sql2 = "SELECT id_ideia, id_usuario FROM curtida_ideia WHERE "
                                    // query para pegar os comentarios
                                    let sql3 = "SELECT m.id_mensagem, m.ct_mensagem, m.id_ideia, u.id_usuario, u.nm_usuario, DATE_ADD(m.hr_mensagem, INTERVAL - 3 HOUR) hr_mensagem FROM tb_mensagem m JOIN tb_usuario u on u.id_usuario = m.id_usuario WHERE uso_mensagem = 2 AND ("
                                    // query para pegar as tecnologias de cada ideia
                                    let sql4 = "SELECT * FROM tecnologia_usada WHERE "                                        
                                            
                                    count = 0
                                    while(count < ideias_pesquisadas.length){
                                        if(count == ideias_pesquisadas.length - 1){
                                            sql += "id_ideia = " + ideias_pesquisadas[count].id_ideia
                                            sql2 += "id_ideia = " + ideias_pesquisadas[count].id_ideia
                                            sql3 += "id_ideia = " + ideias_pesquisadas[count].id_ideia + ")"
                                            sql4 += "id_ideia = " + ideias_pesquisadas[count].id_ideia
                                        }else{
                                            sql += "id_ideia = " + ideias_pesquisadas[count].id_ideia + " OR "
                                            sql2 += "id_ideia = " + ideias_pesquisadas[count].id_ideia + " OR "
                                            sql3 += "id_ideia = " + ideias_pesquisadas[count].id_ideia + " OR "
                                            sql4 += "id_ideia = " + ideias_pesquisadas[count].id_ideia + " OR "
                                        }
                                        count++
                                    }
                                    // Busco os usuarios atrelados às ideias
                                    database.query(sql, (err4, rows4, fields4) => {
                                        if(err4){
                                            return res.status(403).send({err: "Erro ao buscar usuários colaboradores da ideia"}).end()
                                        }else{
                                            // armazena todos os integrante das ideias
                                            let usuarios_ideias = rows4
                                            
                                            // Saber quantas curtidas tem cada ideia
                                            database.query(sql2, (err5, rows5, fields5) => {
                                                if(err5){
                                                    return res.status(403).send({err: "Erro na busca das curtidas da ideia"}).end()
                                                }else{
                                                    let curtidas_ideias = rows5
                                                    // Saber os comentarios
                                                    database.query(sql3, (err6, rows6, fields6) => {
                                                        if(err6){
                                                            return res.status(403).send({err: "Erro na busca dos comentarios da ideia"}).end()
                                                        }else{
                                                            let comentarios_ideias = rows6

                                                            database.query(sql4, (err7, rows7, fields7) => {
                                                                if(err7){
                                                                    return res.status(403).send({err: "Erro ao buscar tecnologias das ideias"}).end()
                                                                }else{
                                                                    let tecnologias_usadas = rows7
                                                                    // coloca os membros dentro da sua devida ideia
                                                                    for(let i = 0; i < ideias_pesquisadas.length; i++){
                                                                        ideias_pesquisadas[i].membros = []
                                                                        ideias_pesquisadas[i].tecnologias = []      
                                                                        ideias_pesquisadas[i].curtidas = []   
                                                                        ideias_pesquisadas[i].comentarios = []                                                               

                                                                        for(let i2 = 0; i2 < usuarios_ideias.length; i2++){
                                                                            // busca por todos os membros
                                                                            if(usuarios_ideias[i2].id_ideia == ideias_pesquisadas[i].id_ideia){
                                                                                ideias_pesquisadas[i].membros.push(usuarios_ideias[i2])                                                                                                                                                                                                                                          
                                                                            }
                                                                        }   
                                                                        for(let i2 = 0; i2 < tecnologias_usadas.length; i2++){
                                                                            // busca por todas as tecnologias
                                                                            if(tecnologias_usadas[i2].id_ideia == ideias_pesquisadas[i].id_ideia){
                                                                                ideias_pesquisadas[i].tecnologias.push(tecnologias_usadas[i2])
                                                                            }
                                                                        }

                                                                        for(let i2 = 0; i2 < curtidas_ideias.length; i2++){
                                                                            // busca por todas as curtidas
                                                                            if(curtidas_ideias[i2].id_ideia == ideias_pesquisadas[i].id_ideia){
                                                                                ideias_pesquisadas[i].curtidas.push(curtidas_ideias[i2])
                                                                            }
                                                                        }

                                                                        for(let i2 = 0; i2 < comentarios_ideias.length; i2++){
                                                                            // busca por todas os comentários
                                                                            if(comentarios_ideias[i2].id_ideia == ideias_pesquisadas[i].id_ideia){
                                                                                ideias_pesquisadas[i].comentarios.push(comentarios_ideias[i2])
                                                                            }
                                                                        }
                                                                    }
                                                                    let newToken = geraToken({id: id_usuario})
                                                                    return res.status(200).send({
                                                                        ideias: ideias_pesquisadas,
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
                        // exibe o feed com base nas tecnologias
                        while (count < rows.length){
                            tecnologias.push(rows[count].id_tecnologia)
                            count++
                        }
                        // Monta uma pré-query de busca das ideias com base nas tecnologias que o usuario prefere
                        let sql = "SELECT DISTINCT id_ideia FROM tecnologia_ideia WHERE "
    
                        count = 0
                        while (count < tecnologias.length){
                            if(count == tecnologias.length - 1){
                                sql += "id_tecnologia = " + tecnologias[count]
                            }else{
                                sql += "id_tecnologia = " + tecnologias[count] + " OR "
                            }
                            count++
                        }
    
                        database.query(sql, (err2, rows2, fields2) => {
                            if(err2){
                                return res.status(403).send({err: "Erro na busca por ideias"}).end()
                            }else{
                                // Armazena as ideias que tem tecnologias que o usuario prefere
                                let ideias = []
                                count = 0
                                while(count < rows2.length){
                                    ideias.push(rows2[count].id_ideia)
                                    count++
                                }
                                
                                // Buscar todas as ideias que o usuario prefere 
                                count = 0
                                sql = "SELECT * FROM tb_ideia WHERE "
                                while(count < ideias.length){
                                    if(count == ideias.length - 1){
                                        sql += "id_ideia = " + ideias[count]
                                    }else{
                                        sql += "id_ideia = " + ideias[count] + " OR "
                                    }
                                    count++
                                }
    
                                database.query(sql, (err3, rows3, fields3) => {
                                    if(err3){
                                        return res.status(403).send({err: err3}).end()
                                    }else{
                                        // Guarda os dados das ideias que tem tecnologias que o usuario tem interesse
                                        let ideias_pesquisadas = rows3
                                        if(ideias_pesquisadas.length == []){
                                            // Caso não tenha ideias
                                            return res.status(200).send({ideias: ideias_pesquisadas}).end()
                                        }else{
                                            // Caso tenha ideias, pesquisar os usuários que fazem parte destas ideias
                                            // query para pegar participantes
                                            sql = "SELECT * FROM membros_ideias WHERE "                                
                                            // query para pegar quantidade de curtidas
                                            let sql2 = "SELECT id_ideia, id_usuario FROM curtida_ideia WHERE "
                                            // query para pegar os comentarios
                                            let sql3 = "SELECT m.id_mensagem, m.ct_mensagem, m.id_ideia, u.id_usuario, u.nm_usuario, DATE_ADD(m.hr_mensagem, INTERVAL - 3 HOUR) hr_mensagem FROM tb_mensagem m JOIN tb_usuario u on u.id_usuario = m.id_usuario WHERE uso_mensagem = 2 AND ("
                                            // query para pegar as tecnologias de cada ideia
                                            let sql4 = "SELECT * FROM tecnologia_usada WHERE "                                        
                                                    
                                            count = 0
                                            while(count < ideias_pesquisadas.length){
                                                if(count == ideias_pesquisadas.length - 1){
                                                    sql += "id_ideia = " + ideias_pesquisadas[count].id_ideia
                                                    sql2 += "id_ideia = " + ideias_pesquisadas[count].id_ideia
                                                    sql3 += "id_ideia = " + ideias_pesquisadas[count].id_ideia + ")"
                                                    sql4 += "id_ideia = " + ideias_pesquisadas[count].id_ideia
                                                }else{
                                                    sql += "id_ideia = " + ideias_pesquisadas[count].id_ideia + " OR "
                                                    sql2 += "id_ideia = " + ideias_pesquisadas[count].id_ideia + " OR "
                                                    sql3 += "id_ideia = " + ideias_pesquisadas[count].id_ideia + " OR "
                                                    sql4 += "id_ideia = " + ideias_pesquisadas[count].id_ideia + " OR "
                                                }
                                                count++
                                            }
                                            // Busco os usuarios atrelados às ideias
                                            database.query(sql, (err4, rows4, fields4) => {
                                                if(err4){
                                                    return res.status(403).send({err: "Erro ao buscar usuários colaboradores da ideia"}).end()
                                                }else{
                                                    // armazena todos os integrante das ideias
                                                    let usuarios_ideias = rows4
                                                    
                                                    // Saber quantas curtidas tem cada ideia
                                                    database.query(sql2, (err5, rows5, fields5) => {
                                                        if(err5){
                                                            return res.status(403).send({err: "Erro na busca das curtidas da ideia"}).end()
                                                        }else{
                                                            let curtidas_ideias = rows5
                                                            // Saber os comentarios
                                                            database.query(sql3, (err6, rows6, fields6) => {
                                                                if(err6){
                                                                    return res.status(403).send({err: "Erro na busca dos comentarios da ideia"}).end()
                                                                }else{
                                                                    let comentarios_ideias = rows6
    
                                                                    database.query(sql4, (err7, rows7, fields7) => {
                                                                        if(err7){
                                                                            return res.status(403).send({err: "Erro ao buscar tecnologias das ideias"}).end()
                                                                        }else{
                                                                            let tecnologias_usadas = rows7
                                                                            // coloca os membros dentro da sua devida ideia
                                                                            for(let i = 0; i < ideias_pesquisadas.length; i++){
                                                                                ideias_pesquisadas[i].membros = []
                                                                                ideias_pesquisadas[i].tecnologias = []      
                                                                                ideias_pesquisadas[i].curtidas = []   
                                                                                ideias_pesquisadas[i].comentarios = []                                                               
    
                                                                                for(let i2 = 0; i2 < usuarios_ideias.length; i2++){
                                                                                    // busca por todos os membros
                                                                                    if(usuarios_ideias[i2].id_ideia == ideias_pesquisadas[i].id_ideia){
                                                                                        ideias_pesquisadas[i].membros.push(usuarios_ideias[i2])                                                                                                                                                               
                                                                                    }
                                                                                }
    
                                                                                for(let i2 = 0; i2 < tecnologias_usadas.length; i2++){
                                                                                    // busca por todas as tecnologias
                                                                                    if(tecnologias_usadas[i2].id_ideia == ideias_pesquisadas[i].id_ideia){
                                                                                        ideias_pesquisadas[i].tecnologias.push(tecnologias_usadas[i2])
                                                                                    }
                                                                                }
    
                                                                                for(let i2 = 0; i2 < curtidas_ideias.length; i2++){
                                                                                    // busca por todas as curtidas
                                                                                    if(curtidas_ideias[i2].id_ideia == ideias_pesquisadas[i].id_ideia){
                                                                                        ideias_pesquisadas[i].curtidas.push(curtidas_ideias[i2])
                                                                                    }
                                                                                }
    
                                                                                for(let i2 = 0; i2 < comentarios_ideias.length; i2++){
                                                                                    // busca por todas os comentários
                                                                                    if(comentarios_ideias[i2].id_ideia == ideias_pesquisadas[i].id_ideia){
                                                                                        ideias_pesquisadas[i].comentarios.push(comentarios_ideias[i2])
                                                                                    }
                                                                                }
                                                                            }
                                                                            let newToken = geraToken({id: id_usuario})
                                                                            return res.status(200).send({
                                                                                ideias: ideias_pesquisadas,
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
                            }
                        })             
                        }
                    }
                    
                })
            }
        }
    })    
}

/**
 * Mostra as 3 melhores ideias com base em suas curtidas (trends)
 * 
 * @params void
 * 
 * @body void
 * 
 * @return JSON {ideia1, ideia2, ideia3} / {err}
 */
exports.top_ideias = (req, res) => {

    database.query("SELECT id_ideia, COUNT(*) as qt_curtida FROM curtida_ideia GROUP BY id_ideia ORDER BY qt_curtida DESC LIMIT 3; ", (err, rows, fields) => {
        if(err){
            return res.status(403).send({err: err}).end()
        }else{
            let ideia1 = rows[0]
            let ideia2 = rows[1]
            let ideia3 = rows[2]            
            
            database.query("SELECT id_ideia, count(*) as qt_comentario FROM tb_mensagem WHERE uso_mensagem = 2 AND (id_ideia = ? OR id_ideia = ? OR id_ideia = ?) group by id_ideia", [ideia1.id_ideia, ideia2.id_ideia, ideia3.id_ideia], (err2, rows2, fields2) => {
                if(err2){
                    return res.status(403).send({err: err2}).end()
                }else{
                    if(rows2[0]){
                        if(rows2[0].id_ideia == ideia1.id_ideia){
                            ideia1.qt_comentarios = rows2[0].qt_comentario
                        }else if (rows2[0].id_ideia == ideia2.id_ideia){
                            ideia2.qt_comentarios = rows2[0].qt_comentario
                        }else{
                            ideia3.qt_comentarios = rows2[0].qt_comentario
                        }                        
                    }

                    if(rows2[1]){
                        if(rows2[1].id_ideia == ideia1.id_ideia){
                            ideia1.qt_comentarios = rows2[1].qt_comentario
                        }else if (rows2[1].id_ideia == ideia2.id_ideia){
                            ideia2.qt_comentarios = rows2[1].qt_comentario
                        }else{
                            ideia3.qt_comentarios = rows2[1].qt_comentario
                        } 
                    }

                    if(rows2[2]){
                        if(rows2[2].id_ideia == ideia1.id_ideia){
                            ideia1.qt_comentarios = rows2[2].qt_comentario
                        }else if (rows2[2].id_ideia == ideia2.id_ideia){
                            ideia2.qt_comentarios = rows2[2].qt_comentario
                        }else{
                            ideia3.qt_comentarios = rows2[2].qt_comentario
                        } 
                    }

                    if(!ideia1.qt_comentarios){
                        ideia1.qt_comentarios = 0
                    }
                    if(!ideia2.qt_comentarios){
                        ideia2.qt_comentarios = 0
                    }
                    if(!ideia3.qt_comentarios){
                        ideia3.qt_comentarios = 0
                    }

                    // pegar todos os dados das trends
                    database.query("SELECT i.id_ideia as id_ideia, i.nm_ideia as nm_ideia, i.ds_ideia as ds_ideia, u.nm_usuario as nm_idealizador, u.id_usuario as id_idealizador FROM tb_ideia as i JOIN participante_ideia as p on p.id_ideia = i.id_ideia AND p.idealizador = 1 join tb_usuario as u on u.id_usuario = p.id_usuario WHERE i.id_ideia = ? OR i.id_ideia = ? OR i.id_ideia = ?", [ideia1.id_ideia, ideia2.id_ideia, ideia3.id_ideia], (err3, rows3, fields3) => {
                        if(err3){
                            return res.status(403).send({err: err3}).end()
                        }else{
                            if(rows3[0].id_ideia == ideia1.id_ideia){
                                ideia1.nm_ideia = rows3[0].nm_ideia
                                ideia1.ds_ideia = rows3[0].ds_ideia
                                ideia1.nm_idealizador = rows3[0].nm_idealizador
                            }else if (rows3[0].id_ideia == ideia2.id_ideia){
                                ideia2.nm_ideia = rows3[0].nm_ideia
                                ideia2.ds_ideia = rows3[0].ds_ideia
                                ideia2.nm_idealizador = rows3[0].nm_idealizador
                            }else{
                                ideia3.nm_ideia = rows3[0].nm_ideia
                                ideia3.ds_ideia = rows3[0].ds_ideia
                                ideia3.nm_idealizador = rows3[0].nm_idealizador
                            }

                            if(rows3[1].id_ideia == ideia1.id_ideia){
                                ideia1.nm_ideia = rows3[1].nm_ideia
                                ideia1.ds_ideia = rows3[1].ds_ideia
                                ideia1.nm_idealizador = rows3[1].nm_idealizador
                            }else if (rows3[1].id_ideia == ideia2.id_ideia){
                                ideia2.nm_ideia = rows3[1].nm_ideia
                                ideia2.ds_ideia = rows3[1].ds_ideia
                                ideia2.nm_idealizador = rows3[1].nm_idealizador
                            }else{
                                ideia3.nm_ideia = rows3[1].nm_ideia
                                ideia3.ds_ideia = rows3[1].ds_ideia
                                ideia3.nm_idealizador = rows3[1].nm_idealizador
                            }

                            if(rows3[2].id_ideia == ideia1.id_ideia){
                                ideia1.nm_ideia = rows3[2].nm_ideia
                                ideia1.ds_ideia = rows3[2].ds_ideia
                                ideia1.nm_idealizador = rows3[2].nm_idealizador
                            }else if (rows3[2].id_ideia == ideia2.id_ideia){
                                ideia2.nm_ideia = rows3[2].nm_ideia
                                ideia2.ds_ideia = rows3[2].ds_ideia
                                ideia2.nm_idealizador = rows3[2].nm_idealizador
                            }else{
                                ideia3.nm_ideia = rows3[2].nm_ideia
                                ideia3.ds_ideia = rows3[2].ds_ideia
                                ideia3.nm_idealizador = rows3[2].nm_idealizador
                            }
                
                            ideia1.membros = []
                            ideia2.membros = []
                            ideia3.membros = []

                            ideia1.curtidas = []
                            ideia2.curtidas = []
                            ideia3.curtidas = []
                            database.query("SELECT * FROM membros_ideias WHERE id_ideia = ? OR id_ideia = ? OR id_ideia = ?", [ideia1.id_ideia, ideia2.id_ideia, ideia3.id_ideia], (err4, rows4, fields4) => {
                                if(err4){
                                    return res.status(403).send({err: err4}).end()
                                }else{
                                    for(let i = 0; i < rows4.length; i++){
                                        if(rows4[i].id_ideia == ideia1.id_ideia){
                                            ideia1.membros.push(rows4[i])
                                        }else if (rows4[i].id_ideia == ideia2.id_ideia){
                                            ideia2.membros.push(rows4[i])
                                        }else if (rows4[i].id_ideia == ideia3.id_ideia){
                                            ideia3.membros.push(rows4[i])
                                        }
                                    }
                                    database.query("SELECT * FROM curtida_ideia WHERE id_ideia = ? OR id_ideia = ? OR id_ideia = ?", [ideia1.id_ideia, ideia2.id_ideia, ideia3.id_ideia], (err5, rows5, fields5) => {
                                        if(err5){
                                            return res.status(403).send({err: err5}).end()
                                        }else{
                                            for(let i = 0; i < rows5.length; i++){
                                                if(rows5[i].id_ideia == ideia1.id_ideia){
                                                    ideia1.curtidas.push(rows5[i])
                                                }else if (rows5[i].id_ideia == ideia2.id_ideia){
                                                    ideia2.curtidas.push(rows5[i])
                                                }else if (rows5[i].id_ideia == ideia3.id_ideia){
                                                    ideia3.curtidas.push(rows5[i])
                                                }
                                            }
                                            return res.status(200).send({
                                                ideia1,
                                                ideia2,
                                                ideia3
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
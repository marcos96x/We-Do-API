/**
 * Diretorio - src/controllers/notificacao.js
 */

const database = require("../models/database")()

/**
* Busca por curtidas relacionadas a alguma ideia na qual o usuario é idealizador
* @param id_usuario, id_curtida
*
* @body null
*
* @return JSON {curtidas} / {err}
*/
exports.curtida = (req, res) => {

	let id_usuario = req.params.id_usuario
	let id_curtida = req.params.id_curtida
	let sql = "SELECT u.nm_usuario, i.nm_ideia, i.id_ideia FROM tb_usuario as u "
			sql += "JOIN curtida_ideia as c ON c.id_usuario = u.id_usuario "
			sql += "JOIN tb_ideia as i ON c.id_ideia = i.id_ideia "
			sql += "JOIN participante_ideia as p ON p.id_ideia = c.id_ideia "
			sql += "WHERE c.id_curtida > " + id_curtida + " AND p.id_usuario = " + id_usuario + " AND p.idealizador = 1"

	database.query(sql, (err, rows, fields) => {
		if(err){
			return res.status(403).send({err: err}).end()
		}else{
			return res.status(200).send({qt_curtidas: rows.length, curtidas: rows}).end()
		}
	})
}

/**
* Busca por possíveis comentários feitos nas ideias caso o usuário seja o idealizador
* @param id_usuario, id_comentario(id_ultimo_comentario_visto)
*
* @body null
*
* @return JSON {comentarios} / {err}
*/
exports.comentarios = (req, res) => {
	let id_usuario = req.params.id_usuario
	let id_comentario = req.params.id_comentario

	let sql = "SELECT id_ideia FROM participante_ideia WHERE id_usuario = " + id_usuario + " AND idealizador = 1"
	database.query(sql, (err, rows, fields) => {
		if(err){
			return res.status(403).send({err: err}).end()
		}else{
			sql = "SELECT * FROM mensagens WHERE uso_mensagem = 2 AND id_mensagem > " + id_comentario + " AND "
			for(let i = 0; i < rows.length; i++){
				if(i == rows.length - 1){
					sql += "id_ideia = " + rows[i].id_ideia + ";"
				}else{
					sql += "id_ideia = " + rows[i].id_ideia + " OR "
				}
			}
			
			database.query(sql, (err2, rows2, fields2) => {
				if(err2){
					return res.status(403).send({err: err2}).end()
				}else{
					let qt_comentarios = rows2.length
					let comentarios = rows2

					return res.status(200).send({qt_comentarios: qt_comentarios, comentarios: comentarios}).end()
				}
			})			
		}
	})		
}

/**	
 * BUSCA por solicitações de entrada na ideia
 * 
 * @param id_usuario
 * 
 * @body void
 * 
 * @return JSON {solicitacao} / {err}
 */
exports.interesse = (req, res) => {
	let id_usuario = req.params.id_usuario

	let sql = "SELECT id_ideia FROM participante_ideia WHERE id_usuario = " + id_usuario + " AND idealizador = 1"
	database.query(sql, (err, rows, fields) => {
		if(err){
			return res.status(403).send({err: err}).end()
		}else{
			if(rows.length > 0){
				sql = "SELECT * FROM participante_ideia WHERE idealizador = 0 AND status_solicitacao <> 2 AND "
				for(let i = 0; i < rows.length; i++){
					if(i == rows.length - 1){
						sql += "id_ideia = " + rows[i].id_ideia + ";"
					}else{
						sql += "id_ideia = " + rows[i].id_ideia + " OR "
					}
				}
				
				database.query(sql, (err2, rows2, fields2) => {
					if(err2){
						return res.status(403).send({err: err2}).end()
					}else{					
						return res.status(200).send({interesses: rows2}).end()
					}
				})
			}else{
				return res.status(200).send({interesses: []}).end()
			}						
		}
	})
}

/**	
 * Muda a ultima curtida no banco de dados na tabela notificacao
 * 
 * @param
 * 
 * @body "usuario": {
 * 			"id_usuario": <id>,
 * 			"id_curtida": <id da curtida>
 * 		}
 * 
 * @return JSON {msg} / {err}
 */
exports.muda_curtida = (req, res) => {
	let id_usuario = req.body.usuario.id_usuario
	let id_curtida = req.body.usuario.id_curtida

	database.query("UPDATE tb_notificacao SET id_ultima_curtida = ? WHERE id_usuario = ?;", [id_curtida, id_usuario], (err, rows, fields) => {
		if(err){
			return res.status(403).send({err: err}).end()
		}else{
			return res.status(403).send({msg: 'Ok'}).end()
		}
	})
}

/**	
 * Muda o ultimo comentario no banco de dados na tabela notificacao
 * 
 * @param
 * 
 * @body "usuario": {
 * 			"id_usuario": <id>,
 * 			"id_comentario": <id do comentario>
 * 		}
 * 
 * @return JSON {msg} / {err}
 */
exports.muda_comentario = (req, res) => {
	let id_usuario = req.body.usuario.id_usuario
	let id_comentario = req.body.usuario.id_comentario

	database.query("UPDATE tb_notificacao SET id_ultimo_comentario = ? WHERE id_usuario = ?;", [id_comentario, id_usuario], (err, rows, fields) => {
		if(err){
			return res.status(403).send({err: err}).end()
		}else{
			return res.status(403).send({msg: 'Ok'}).end()
		}
	})
}
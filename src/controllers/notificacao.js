/**
 * Diretorio - src/controllers/notificacao.js
 */

const database = require("../models/database")()

exports.busca_notificacoes = (req, res) => {
	let id_usuario = req.params.id_usuario

	database.query("SELECT * FROM tb_notificacao WHERE id_usuario = ?", id_usuario, (err, rows, fields) => {
		if(err){
			return res.status(403).send({err: err}).end()
		}else{
			return res.status(200).send({notificacoes: rows}).end()
		}
	})
}

exports.muda_notificacoes_para_visualizadas = (req, res) => {
	let id_usuario = req.params.id_usuario

	database.query("UPDATE tb_notificacoes SET visualizada = '1' WHERE id_usuario = ?", id_usuario, (err, rows, fields) => {
		if(err){
			return res.status(403).send({err: err}).end()
		}else{
			return res.status(200).send({msg: "Ok"}).end()
		}
	})
}
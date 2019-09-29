// src/routes/comentario.js

module.exports = app => {
    const controllerComentario = require("../controllers/comentarios")
    const authMiddleware = require("../middlewares/auth") 


    app.route("/comentario/:id_usuario")
        .all()
        .get(controllerComentario.mostra_comentarios)
        .post(controllerComentario.envia_comentario)
        .delete(controllerComentario.apaga_comentario)
}
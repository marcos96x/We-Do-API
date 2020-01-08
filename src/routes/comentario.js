// src/routes/comentario.js

module.exports = app => {
    const controllerComentario = require("../controllers/comentarios")
    const authMiddleware = require("../middlewares/auth") 

    
    app.post("/comentario",  [authMiddleware.auth, controllerComentario.envia_comentario])
    app.delete("/comentario", [authMiddleware.auth, controllerComentario.apaga_comentario])
}
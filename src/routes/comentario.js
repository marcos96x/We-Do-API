// src/routes/comentario.js

module.exports = app => {
    const controllerComentario = require("../controllers/comentarios")
    const authMiddleware = require("../middlewares/auth") 


    
    app.post("/comentario", controllerComentario.envia_comentario)
    app.delete("/comentario", controllerComentario.apaga_comentario)
}
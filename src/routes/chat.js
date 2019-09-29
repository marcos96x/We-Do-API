// ./src/routes/chat.js

module.exports = app => {

    const controllerChat = require("../controllers/chat") 
    const authMiddleware = require("../middlewares/auth") 
    const chatMiddleware = require("../middlewares/chatAuth")

    app.route("/chat/:id_usuario")
        .all()
        .post(controllerChat.recebe_mensagem)
        .post(controllerChat.envia_mensagem) 
}   
// ./src/routes/chat.js

module.exports = app => {

    const controllerChat = require("../controllers/chat") 
    const authMiddleware = require("../middlewares/auth") 
    const chatMiddleware = require("../middlewares/chatAuth")

    app.route("/chat/:id_usuario&:id_ideia")
        .all([authMiddleware.auth, chatMiddleware.auth])
        .get( controllerChat.recebe_mensagem)
        .post( controllerChat.envia_mensagem) 
}



  
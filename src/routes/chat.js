// ./src/routes/chat.js

module.exports = app => {

    const controllerChat = require("../controllers/chat") 
    const authMiddleware = require("../middlewares/auth") 
    const chatMiddleware = require("../middlewares/chatAuth")
    const database = require("../models/database")()

    app.route("/chat/:id_usuario&:id_ideia")
        .all()
        .get(controllerChat.recebe_mensagem)
        .post(controllerChat.envia_mensagem) 
}



  
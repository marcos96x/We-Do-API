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


    // Toda a parte de socket
    var app = require("express")()
    var http = require('http').createServer(app);
    var io = require('socket.io')(http);

    io.origins(['http://127.0.0.1:5500']);

    io.on('connection', (socket) => {
        socket.on("chat_message", (dados) => {
            database.query("CALL spInsere_chat(?, ?, ?)", [dados.id_usuario, dados.id_ideia, dados.ct_mensagem], (err, rows, fields) => {
                if(err){
                    return res.status(403).send({err: err}).end()
                }else{            
                    io.emit("chat_message", dados)
                }
            })
        })
        socket.on("notification", (dados) => {
            if(dados.acao == 1){
                // curtida
                database.query("SELECT * FROM tb_notificacao WHERE id_usuario_acao = ? AND id_ideia = ? AND tp_notificacao = 1", [dados.id_usuario, dados.id_ideia], (err, rows, fields) => {
                    if(err){
                        return res.status(403).send({err: err}).end()
                    }else{
                        io.emit("notification", rows[0])
                    }
                })
            }else if (dados.acao == 2){
                // comentario
                database.query("SELECT * FROM tb_notificacao WHERE id_usuario_acao = ? AND id_ideia = ? AND tp_notificacao = 2", [dados.id_usuario, dados.id_ideia], (err, rows, fields) => {
                    if(err){
                        return res.status(403).send({err: err}).end()
                    }else{
                        io.emit("notification", rows[0])
                    }
                })
            }else if (dados.acao == 3){
                // solicitação
                database.query("SELECT * FROM tb_notificacao WHERE id_usuario_acao = ? AND id_ideia = ? AND tp_notificacao = 3", [dados.id_usuario, dados.id_ideia], (err, rows, fields) => {
                    if(err){
                        return res.status(403).send({err: err}).end()
                    }else{
                        io.emit("notification", rows[0])
                    }
                })
            }else if (dados.acao == 4){
                // pessoa foi aceita na ideia
                database.query("SELECT nm_ideia FROM tb_ideia WHERE id_ideia = ?", dados.id_ideia, (err, rows, fields) => {
                    if(err){
                        return res.status(403).send({err: err}).end()
                    }else{
                        dados.nm_ideia = rows[0].nm_ideia
                        io.emit("notification", dados)
                    }
                })
            }
        })
        
    })

    http.listen(8080, () => {
        console.log("Server de chat rodando na porta 8080")
    })
}



  
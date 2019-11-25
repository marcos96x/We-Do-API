const database = require("../models/database")()
var app = require("express")()
var http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', (socket) => {
    socket.on("chat_message", (dados) => {
        database.query("CALL spInsere_chat(?, ?, ?)", [dados.id_usuario, dados.id_ideia, dados.ct_mensagem], (err, rows, fields) => {
            if (err) {
                return err
            } else {
                io.emit("chat_message", dados)
            }
        })
    })
    socket.on("notification", (dados) => {
        if (dados.acao == 1) {
            // curtida
            database.query("SELECT * FROM tb_notificacao WHERE id_usuario_acao = ? AND id_ideia = ? AND tp_notificacao = 1", [Number(dados.id_usuario), dados.id_ideia], (err, rows, fields) => {
                if (err) {
                    return err
                } else {
                    io.emit("notification", rows[0])
                }
            })
        } else if (dados.acao == 2) {
            // comentario
            database.query("SELECT * FROM tb_notificacao WHERE id_usuario_acao = ? AND id_ideia = ? AND tp_notificacao = 2", [Number(dados.id_usuario), dados.id_ideia], (err, rows, fields) => {
                if (err) {
                    return err
                } else {
                    io.emit("notification", rows[0])
                }
            })
        } else if (dados.acao == 3) {
            // solicitação
            database.query("SELECT * FROM tb_notificacao WHERE id_usuario_acao = ? AND id_ideia = ? AND tp_notificacao = 3", [Number(dados.id_usuario), dados.id_ideia], (err, rows, fields) => {
                if (err) {
                    return err
                } else {
                    io.emit("notification", rows[0])
                }
            })
        } else if (dados.acao == 4) {
            // pessoa foi aceita na ideia
            database.query("SELECT nm_ideia FROM tb_ideia WHERE id_ideia = ?", dados.id_ideia, (err, rows, fields) => {
                if (err) {
                    return err
                } else {
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
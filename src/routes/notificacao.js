module.exports = app => {
    const controllerNotificacao = require("../controllers/notificacao")

    app.get("/notificacao/comentarios/:id_usuario&:id_comentario", controllerNotificacao.comentarios)

    app.get("/notificacao/curtidas/:id_usuario&:id_curtida", controllerNotificacao.curtida)

    app.get("/notificacao/interesse/:id_usuario", controllerNotificacao.interesse)
}
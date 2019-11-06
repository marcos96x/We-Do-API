module.exports = app => {
    const controllerNotificacao = require("../controllers/notificacao")

    app.get("/notificacoes/:id_usuario", controllerNotificacao.busca_notificacoes)
    app.put("/notificacoes/:id_usuario", controllerNotificacao.muda_notificacoes_para_visualizadas)
}
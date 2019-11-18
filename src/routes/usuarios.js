// ./src/routes/usuarios.js

module.exports = app => {
    const controllerUsuario = require("../controllers/usuario") 
    const authMiddleware = require("../middlewares/auth") 
    
    // -------------- Rotas relacionadas ao usuário
    app.post("/usuario/login", controllerUsuario.login) 
    app.post("/usuario/recuperar_senha", controllerUsuario.recupera_senha)
    app.post("/usuario/cadastro", controllerUsuario.cadastro)
 
    app.get("/usuario/perfil/:id_usuario&:id_usuario_pesquisado", controllerUsuario.perfil)

    app.post("/usuario/denuncia", controllerUsuario.denuncia)

    app.put("/usuario/alterar/:id_usuario", [controllerUsuario.atualiza_dados])    
    app.put("/usuario/alterar_senha/:id_usuario", controllerUsuario.troca_senha)
    app.put("/usuario/troca_senha", controllerUsuario.troca_senha_recuperacao)

    app.delete("/usuario", controllerUsuario.deleta)

    // rota de validação do email
    app.post("/usuario/valida_conta", controllerUsuario.valida_conta)
    app.post("/usuario/saber_id", controllerUsuario.pega_id_do_token)
}   
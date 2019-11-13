// ./src/routes/usuarios.js

module.exports = app => {
    const controllerUsuario = require("../controllers/usuario") 
    const authMiddleware = require("../middlewares/auth") 
    
    // -------------- Rotas relacionadas ao usuário
    app.post("/usuario/login", controllerUsuario.login) 
    app.get("/usuario/recuperar_senha", controllerUsuario.recupera_senha)
    app.post("/usuario/cadastro", controllerUsuario.cadastro)
 
    app.get("/usuario/perfil/:id_usuario&:id_usuario_pesquisado", controllerUsuario.perfil)

    app.post("/usuario/denuncia", [authMiddleware.auth, controllerUsuario.denuncia])

    app.put("/usuario/alterar/:id_usuario", [authMiddleware.auth, controllerUsuario.atualiza_dados])    
    app.put("/usuario/alterar_senha/:id_usuario", [authMiddleware.auth, controllerUsuario.troca_senha])

    app.delete("/usuario", controllerUsuario.deleta)

    // rota de validação do email
    app.post("/usuario/valida_conta", controllerUsuario.valida_conta)
}   
module.exports = app => {
    
    const controllerIdeia = require("../controllers/ideia")
    const authMiddleware = require("../middlewares/auth") 

    app.get("/ideia/:id_ideia&:id_usuario", [authMiddleware.auth , controllerIdeia.ver_ideia])

    app.get("/ideia/portifolio/:id_usuario", [controllerIdeia.portifolio])
    
    app.get("/ideia/projetos_atuais/:id_usuario",[controllerIdeia.projetos_atuais])

    app.get("/ideia/busca_nome/:nome", controllerIdeia.buscar_nome)

    app.get("/ideia/busca_tecnologia/:tecnologia", controllerIdeia.buscar_tecnologias)

    app.get("/ideia/busca_tecnologia_nome/:tecnologia&:nome", controllerIdeia.buscar_tecnologias_nome)

    app.post("/ideia",[authMiddleware.auth, controllerIdeia.cria_ideia])
    
    app.post("/ideia/tags",[authMiddleware.auth, controllerIdeia.add_tags])

    app.put("/ideia",[authMiddleware.auth, controllerIdeia.altera_dados])

    app.put("/ideia/passar", [authMiddleware.auth, controllerIdeia.passa_ideia])

    app.put("/ideia/status", [authMiddleware.auth, controllerIdeia.muda_status])
    
    app.put("/ideia/interesse/:id_usuario",[authMiddleware.auth, controllerIdeia.aprova_interesse])

    app.delete("/ideia/remover", [authMiddleware.auth, controllerIdeia.remove_usuario])

    app.delete("/ideia/deletar", [authMiddleware.auth, controllerIdeia.deleta_ideia])

    app.delete("/ideia/sair", [authMiddleware.auth, controllerIdeia.sair_ideia])
                                                                        
}
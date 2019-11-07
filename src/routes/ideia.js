module.exports = app => {
    
    const controllerIdeia = require("../controllers/ideia")
    const authMiddleware = require("../middlewares/auth") 

    app.get("/ideia/:id_ideia&:id_usuario", controllerIdeia.ver_ideia)

    app.get("/ideia/portifolio/:id_usuario", controllerIdeia.portifolio)
    
    app.get("/ideia/projetos_atuais/:id_usuario", controllerIdeia.projetos_atuais)

    app.get("/ideia/busca_nome/:nome", controllerIdeia.buscar_nome)

    app.get("/ideia/busca_tecnologia/:tecnologia", controllerIdeia.buscar_tecnologias)

    app.get("/ideia/busca_tecnologia_nome/:tecnologia&:nome", controllerIdeia.buscar_tecnologias_nome)

    app.post("/ideia", controllerIdeia.cria_ideia)
    
    app.post("ideia/tags", controllerIdeia.add_tags)

    app.put("/ideia", controllerIdeia.altera_dados)

    app.put("/ideia/passar", controllerIdeia.passa_ideia)

    app.put("/ideia/status", controllerIdeia.muda_status)
    
    app.put("/ideia/interesse", controllerIdeia.aprova_interesse)

    app.delete("/ideia/remover", controllerIdeia.remove_usuario)

    app.delete("/ideia/deletar", controllerIdeia.deleta_ideia)

    app.delete("/ideia/sair", controllerIdeia.sair_ideia)
                                                                        
}
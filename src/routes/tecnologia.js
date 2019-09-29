
module.exports = app => {
    const controllerTecnologia = require("../controllers/tecnologia")
    const authMiddleware = require("../middlewares/auth") 

    app.get("/tecnologia", controllerTecnologia.busca_tecnologia)

    app.post("/tecnologia/usuario", [authMiddleware.auth, controllerTecnologia.tecnologia_usuario])
    
    app.post("/tecnologia/ideia", [authMiddleware.auth, controllerTecnologia.tecnologia_ideia])

}

module.exports = app => {
    const controllerTecnologia = require("../controllers/tecnologia")
    const authMiddleware = require("../middlewares/auth") 

    app.get("/tecnologia", controllerTecnologia.busca_tecnologia)

    app.post("/tecnologia/usuario", [controllerTecnologia.tecnologia_usuario])
    
    app.post("/tecnologia/ideia", [controllerTecnologia.tecnologia_ideia])

}
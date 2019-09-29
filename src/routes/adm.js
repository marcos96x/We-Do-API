module.exports = app => {
    const controllerAdm = require("../controllers/adm")

    app.get("/adm/usuario", controllerAdm.pesquisa_usuario)
    app.put("adm/tecnologia", controllerAdm.altera_tecnologia)
}
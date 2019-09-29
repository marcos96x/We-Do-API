const bodyParser = require("body-parser")
const cors = require("cors")
module.exports = app => {
    //Middlewares externos padrões no projeto
    app.use(bodyParser.json())
    app.use(cors({
        origin: "*"
    }))
    // Configurações 
    app.set("port", 3000)
    app.set("database", require("../src/models/database"))
}
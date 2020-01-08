
module.exports = app => {
    const controllerFeed = require("../controllers/feed")
    const authMiddleware = require("../middlewares/auth") 

    app.get("/feed/:id_usuario", [authMiddleware.auth, controllerFeed.feed])   

    app.get("/trends", controllerFeed.top_ideias)

    app.post("/curtida", controllerFeed.curtida)
    
    app.post("/interesse", [controllerFeed.interesse])

}
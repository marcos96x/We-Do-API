// ./src/middlewares/auth.js
const jwt = require("jsonwebtoken")
const authConfig = require("../../libs/auth")

exports.auth = (req, res, next) => {
    
    const authToken = req.headers.Authorization
    if(!authToken){
        res.status(401).send({err: "Token não providenciado"}) 
        res.end()    
    }else{
        const parts = authToken.split(" ")

        if(!parts.length === 2){
            res.status(401).send({err: "Erro no token"})
            res.end()             
        }else{
            const [scheme, token] = parts

            if(!/^Bearer$/i.test(scheme)){
                res.status(401).send({err: "Erro de formação do token"})
                res.end()                
            }else{
                jwt.verify(token, authConfig.secret, (err, decoded) => {
                    if(err){
                        res.status(401).send({err: "Token invalido"})
                        res.end() 
                    }else{
                        if(decoded.id == req.params.id_usuario || decoded.id == req.body.usuario.id_usuario){
                            next()
                        }else{
                            res.status(401).send({err: "Token adulterado"})
                            res.end() 
                        }                      
                    }
                })
            }                
        }
    }
}

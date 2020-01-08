// ./src/middlewares/auth.js
const jwt = require("jsonwebtoken")
const authConfig = require("../../libs/auth")

exports.auth = (req, res, next) => {
    
    const authToken = req.headers.authorization
    if(!authToken){
        return res.status(401).send({err: "Token não providenciado"}).end()
    }else{
        const parts = authToken.split(" ")

        if(!parts.length === 2){
            return res.status(401).send({err: "Erro no token"}).end()
        }else{
            const [scheme, token] = parts

            if(!/^Bearer$/i.test(scheme)){
                return res.status(401).send({err: "Erro de formação do token"}).end()
            }else{
                jwt.verify(token, authConfig.secret, (err, decoded) => {
                    if(err){
                        return res.status(401).send({err: "Token invalido"}).end()
                    }else{
                        if(req.params.id_usuario){
                            if(decoded.id == req.params.id_usuario){
                                next()
                            }else{
                                return res.status(401).send({err: "Token adulterado"}).end()
                            }
                        }else if (req.body.usuario.id_usuario){
                            if(decoded.id == req.body.usuario.id_usuario){
                                next()
                            }else{
                                return res.status(401).send({err: "Token adulterado"}).end()
                            }
                        }                                              
                    }
                })
            }                
        }
    }
}

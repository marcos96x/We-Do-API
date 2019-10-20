module.exports = app => {


    app.listen(app.get("port"), () => console.log(`Server aberto - Porta: ${app.get("port")}`))
}
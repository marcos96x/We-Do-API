
module.exports = app => {
    const host = "localhost";
    const usuario = "root";
    const senha = "mencholipa14";
    const db = "db_we_do";
    const mysql = require("mysql");

    var pool = mysql.createPool({ 
        host : host, 
        user : usuario, 
        password : senha, 
        database : db, 
        connectionLimit : 10
    });

    pool.getConnection(function (err, conn) {
         if (err) 
            return 400;
    });
    return pool;    


};

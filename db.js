const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'minorudatabase.cvm0uaaguq3v.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: '12345678',
    database: 'demodb'
});

connection.connect((error) => {
    if (error) {
        console.error('Error al conectar con la base de datos:', error);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});

module.exports = connection;

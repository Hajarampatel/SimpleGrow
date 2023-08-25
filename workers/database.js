const util = require('util');
const mysql = require('mysql');
require('dotenv').config(); 

const pool = mysql.createPool({
    connectionLimit: 20,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
    insecureAuth : true
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.log('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.log('Database connection was refused.');
        }
    } else {
        console.log('Connected To Database...');
    }
    if (connection) connection.release();
});

pool.query = util.promisify(pool.query);
module.exports = pool;
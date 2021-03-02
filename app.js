// Se utiliza para el promosify, transforma callbacks en promise para utilizar con async await
const util = require('util'); 

// Configuracion de express
const express = require('express');
const app = express();

// Express recibira y enviara las solicitudes en formato JSON
app.use(express.json());

// Si el programa se ejecuta en un servidor, el puerto lo asignara una variable de entorno
// Caso contrario se utilizara el puerto 3000
const PORT = process.env.PORT || 3000;

// Configuracion mysql
const mysql = require('mysql');

// Estos datos de conexion pueden variar segun como este configurado el servidor de cada usuario
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'my_books'
});

conexion.connect((error) => {
    if (error) {
        throw error;
    }

    console.log('Connection with database established.');
});

// permite uso de async await con mysql
const qy = util.promisify(conexion.query).bind(conexion); 


// De aqui en mas se deben escribir las rutas de la API







// Se ejecuta la app para que escuche al puerto determinado
app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT} `);
});

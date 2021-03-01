// Se utiliza para el promosify, transforma callbacks en promise para utilizar con async await
const util = require('util'); 

// Se utiliza para manejar los token de autenticacion
const jwt = require('jsonwebtoken'); 

// Se utiliza para que el middleware de autenticacion no se ejecute en las rutas de login y register
const unless = require('express-unless'); 

// Se utiliza para encriptar la clave provista por el usuario con el fin de guardarla encriptada en la base
// De esta forma quien tenga acceso a la base, no tendra acceso a la clave
const bcrypt = require('bcrypt');

// Se utiliza para que Node lea las variables de entorno del archivo oculto .env
const dotenv = require('dotenv').config();


// Configuracion de express
const express = require('express');
const app = express();

// Se creo un modulo para separar el codigo del middleware en otro archivo
// __dirname se utiliza para que cuando subamos el programa a un servidor, el mismo acceda correctamente
// a las rutas donde se encuentran los archivos
const { auth } = require(__dirname + '/auth');

// Express recibira y enviara las solicitudes en formato JSON
app.use(express.json());

// Se configura auth para utilizar unless
auth.unless = unless;

// Se configuran las rutas excluidas que no seran afectadas por el middleware auth
app.use(auth.unless({
    path: [
        { url: '/login', methods: ['POST'] },
        { url: '/registro', methods: ['POST'] },
    ]
}));

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

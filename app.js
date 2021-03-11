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

// CLAUDIO GARCIA IGLESIA
app.post('/persona', async (req, res) => {
    try {

        // Desestructura el objeto
        let { nombre, apellido, alias, email } = req.body;

        // Verifica que las variables definidas en el paso anterior no sean indefinidas (undefined)
        [nombre, apellido, alias, email].forEach(element => {
            if (!element) {
                throw new Error('Faltan datos')
            }
        });

        // Verifica que no se hayan enviado campos que no existen
        let contador = 0;
        [nombre, apellido, alias, email].forEach(element => {
            if (!!element) { contador++ }
        })
        if (Object.keys(req.body).length > contador) {
            throw new Error('Se enviaron uno o mas campos invalidos')
        };

        // Transforma las variables a tipo string en mayusculas
        [nombre, apellido, alias, email] = [nombre, apellido, alias, email].map(element => (element.toString().toUpperCase()));

        // Verifica que el email no este repetido
        let query = 'SELECT * FROM persona WHERE email = ?';
        let queryRes = await qy(query, [email]);
        if (queryRes.length > 0) {
            throw new Error('La direccion de email ya se encuentra registrada');
        };

        // Carga el nuevo usuario en la base de datos
        query = 'INSERT INTO persona (nombre, apellido, alias, email) VALUES (?, ?, ?, ?)';
        queryRes = await qy(query, [nombre, apellido, alias, email]);

        let id = queryRes.insertId;

        // Muestra la persona actualizada
        query = 'SELECT * FROM persona WHERE id = ?';
        queryRes = await qy(query, id);

        res.status(200);
        res.send(queryRes[0]);

    } catch (e) {
        res.status(413).send({ "Error": e.message });
    }
});

app.put('/persona/:id', async (req, res) => {
    try {
        // Desestructura los parametros y objeto
        const id = req.params.id;
        let { nombre, apellido, alias, email } = req.body;

        // Verifica que no se hayan enviado campos que no existen
        let contador = 0;
        [nombre, apellido, alias, email].forEach(element => {
            if (!!element) { contador++ }
        })
        if (Object.keys(req.body).length > contador) {
            throw new Error('Se enviaron uno o mas campos invalidos')
        };

        // Verifica que la persona exista
        let query = 'SELECT * FROM persona WHERE id = ?';
        let queryRes = await qy(query, id);

        if (queryRes.length === 0) {
            throw new Error('No se encuentra esa persona');
        };

        // Transforma las variables que no sean indefinidas a tipo string en mayusculas
        [nombre, apellido, alias, email] = [nombre, apellido, alias, email].map(element => {
            return (!!element ? element.toString().toUpperCase() : element);
        });

        // Verifica que no se este intentando modificar el email siempre que haya sido enviado
        if ((queryRes[0].email !== email) && (!!email)) { throw new Error('El email no se puede modificar') };

        // Construye el query segun los datos enviados
        // Objeto con los datos a insertar, solo se puede insertar nombre, apellido o alias
        let queryObject = {};

        // String que guardara nombre de las columnas, el signo = y el signo de ? por cada modificacion que sea necesaria
        let querySet = '';

        // Array con los valores a asignar a las columnas para el array del query
        let querySetValues = [];

        // Agrega datos al queryObject siempre que no sean indefinidos
        !!nombre && (queryObject.nombre = nombre);
        !!apellido && (queryObject.apellido = apellido);
        !!alias && (queryObject.alias = alias);

        // Agrega datos desde el objeto al querySet y al querySetValues
        for (const prop in queryObject) {
            querySet = querySet + `${prop} = ?, `;
            querySetValues.push(queryObject[prop]);
        };

        // Remueve la ultima coma que siempre esta de mas pero es necesaria
        querySet = querySet.substring(0, querySet.length - 2);

        // Modifica los campos de persona
        query = `UPDATE persona SET ${querySet} WHERE id = ?`;
        queryRes = await qy(query, [...querySetValues, id]);

        // Muestra la persona actualizada
        query = 'SELECT * FROM persona WHERE id = ?';
        queryRes = await qy(query, id);

        res.status(200);
        res.send(queryRes[0]);

    } catch (e) {
        res.status(413).send({ "Error": e.message });
    }
});




// Se ejecuta la app para que escuche al puerto determinado
app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT} `);
});

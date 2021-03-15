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
    user: 'root',
    password: '',
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

app.delete('/libro/:id', async (req, res)=>{
    try{
        //Primero chequeo que el libro exista
        const id = req.params.id;
        let query = 'SELECT * FROM libro WHERE id = ?';
        let respuesta = await qy(query, id);
        if (respuesta.length==0) {
            throw new Error("No se encuentra este libro");
        } 
        //En caso de que exista verifico el estado de persona_id para ver si fue prestado
        else{
            query = 'SELECT * FROM libro WHERE id = ? AND persona_id <> 0';
            respuesta = await qy(query, id);
            if (respuesta.length>0) {
            throw new Error("Ese libro esta prestado, no se puede borrar");
            } 
            //Por último, ejecuto la consulta para borrar el libro
            else{
            query = 'DELETE FROM libro WHERE id = ?';
            respuesta = await qy(query, id);
            res.status(200).send("Se borro correctamente");
            }
        }

           
    }
    catch(e){
            console.error(e.message);
            res.status(413).send({"Error": e.message});
        }
});

app.put('/libro/devolver/:id', async (req, res)=>{
    try{
        //Compruebo que el libro exista
        let query = 'SELECT * FROM libro WHERE id = ?';
        let respuesta = await qy(query, [req.params.id]);
        if (respuesta.length==0) {
            throw new Error("Ese libro no existe");
        }
        //Compruebo que el libro esté prestado
        else{
        query = 'SELECT * FROM libro WHERE id = ? AND persona_id is NULL';
        respuesta = await qy(query, [req.params.id]);
        if (respuesta.length>0) {
            throw new Error("Ese libro no estaba prestado");
        }
        //Hechas las comprobaciones, actualizo la columna a Null, indicando que el libro está en biblioteca
            else{
            query = 'UPDATE libro SET persona_id = NULL WHERE id = ?';
            respuesta = await qy(query, [req.params.id]);
            res.status(200).send("Se realizo la devolucion correctamente");
            }
        }


       

    }
    catch(e){
            console.error(e.message);
            res.status(413).send({"Error": e.message});
        }
});



// Se ejecuta la app para que escuche al puerto determinado
app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT} `);
});

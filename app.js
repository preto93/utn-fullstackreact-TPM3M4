// Se utiliza para el promosify, transforma callbacks en promise para utilizar con async await
const util = require("util");

// Configuracion de express
const express = require("express");
const app = express();

// Express recibira y enviara las solicitudes en formato JSON
app.use(express.json());

// Si el programa se ejecuta en un servidor, el puerto lo asignara una variable de entorno
// Caso contrario se utilizara el puerto 3000
const PORT = process.env.PORT || 3000;

// Configuracion mysql
const mysql = require("mysql");

// Estos datos de conexion pueden variar segun como este configurado el servidor de cada usuario
const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "my_books",
});

conexion.connect((error) => {
  if (error) {
    throw error;
  }

  console.log("Connection with database established.");
});

// permite uso de async await con mysql
const qy = util.promisify(conexion.query).bind(conexion);

// De aqui en mas se deben escribir las rutas de la API
// Rutas de FerPM

app.post("/libro", async (req, res) => {
  try {
    // Valido que me esten enviando bien la data
    if (!req.body.nombre.toUpperCase) {
      throw new Error("No escribiste el nombre del libro");
    }
    // Antes de guardar el post contemplo la posibilidad de que persona_id pueda venir NULL
    let persona_id = "";
    if (req.body.persona_id) {
      persona_id = req.body.persona_id;
    }
    // Ahora guardamos el post
    const query =
      "INSERT INTO libro (nombre, categoria_id, persona_id) VALUES (?, ?, ?)";
    const respuesta = await qy(query, [
      req.body.nombre.toUpperCase(),
      req.body.categoria_id,
      persona_id,
    ]);
    // volver a ver el video de lorena desde 1:50 para estar mas seguro si no me estoy comiendo algo
    res.send({ respuesta: respuesta });
  } catch (e) {
    console.error(e.message);
    res.status(413).send({ Error: e.message });
  }
});

app.get("/libro/:id", async (req, res) => {
  try {
    const query = "SELECT * FROM libro WHERE id = ?";
    const respuesta = await qy(query, [req.body.nombre, req.params.id]);

    res.send({ respuesta: respuesta });
  } catch (e) {
    console.error(e.message);
    res.status(413).send({ Error: e.message });
  }
});

// Se ejecuta la app para que escuche al puerto determinado
app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT} `);
});

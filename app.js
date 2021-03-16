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

// Cors
const cors = require("cors");
app.use(cors());

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

// IMPORTANTE!!! AVISO QUE TODAVÍA ESTOY REVISANDO MIS RUTAS
// ME DI CUENTA QUE SE ME PASARON MUCHOS DETALLES PEDIDOS EN EL ENUNCIADO DEL TP
// SEGUIRÉ COMITEANDO Y ACTUALIZANDO MAÑANA

app.post("/libro", async (req, res) => {
  try {
    // Valido que me esten enviando bien la data
    if (
      !req.body.nombre.toUpperCase ||
      !req.body.descripcion.toUpperCase ||
      !req.body.categoria_id
    ) {
      throw new Error("No escribiste todos los datos necesarios");
    }

    // ACA ME FALTAN VALIDAR MUCHAS COSAS QUE SE ESPECIFICAR EN EL ENUNCIADO DEL TP Y NO LAS HABÍA VISTO
    // MAÑANA TRABAJARÉ EN ESTO
    // Antes de guardar el post contemplo la posibilidad de que persona_id pueda venir NULL
    let persona_id = "";
    if (req.body.persona_id) {
      persona_id = req.body.persona_id;
    }
    // Ahora guardamos el post
    const query =
      "INSERT INTO libro (nombre, descripcion,, categoria_id, persona_id) VALUES (?, ?, ?, ?)";
    const respuesta = await qy(query, [
      req.body.nombre.toUpperCase(),
      req.body.descricion.toUpperCase(),
      req.body.categoria_id,
      persona_id,
    ]);
    const registroInsertado = await qy("SELECT * FROM libro WHERE id=?", [
      req.params.id,
    ]);
    // ACA HAY QUE VER SI CUANDO DEVUELVE CUMPLE CON EL REQUERIMIENTO
    res.send(registroInsertado[0]);
    res.status(200).send();
  } catch (e) {
    console.error(e.message);
    res.status(413).send({ Error: e.message });
  }
});

app.get("/libro/:id", async (req, res) => {
  try {
    const query = "SELECT * FROM libro WHERE id = ?";
    const respuesta = await qy(query, [req.params.id]);
    if (respuesta.length == 1) {
      res.json(respuesta[0]);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    console.error(e.message);
    res.status(413).send({ Error: e.message });
  }
});

// Se ejecuta la app para que escuche al puerto determinado
app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT} `);
});

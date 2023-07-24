// Imports

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const env = require('dotenv');
env.config();

// Arracar el servidor
const server = express();

// Configuración del servidor

server.use(cors());
server.use(express.json({ limit: '25mb' }));

// Conexion a la base de datos

async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  connection.connect();

  return connection;
}

// Poner a escuchar el servidor

const port = process.env.PORT || 4500;
server.listen(port, () => {
  console.log(`Ya se ha arrancado nuestro servidor: http://localhost:${port}/`);
});

// Endpoints

// GET

server.get('/recetas', async (req, res) => {
  try {
    const recipes = req.params.recetas;
    const selectRecipes = 'SELECT * FROM recetas';
    const connection = await getConnection();
    const [results] = await connection.query(selectRecipes, recipes);
    console.log(results);
    connection.end();

    res.json({
      info: {
        count: results.lenght,
      },
      results: results,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error,
    });
  }
});

server.get('/recetas/:id', async (req, res) => {
  const recipe = req.params.id;
  const select = 'SELECT * FROM recetas WHERE id = ?';
  const connection = await getConnection();
  const [result] = await connection.query(select, recipe);
  console.log(result);
  connection.end();
  res.json({
    success: true,
    results: result,
  });
});

//

server.post('/recetas', async (req, res) => {
  const newRecipe = req.body;
  try {
    const insert =
      'INSERT INTO recetas (nombre, ingredientes, instrucciones) VALUES (?, ?, ?)';
    const connection = await getConnection();
    const [result] = await connection.query(insert, [
      newRecipe.nombre,
      newRecipe.ingredientes,
      newRecipe.instrucciones,
    ]);
    connection.end();
    console.log(result);
    res.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Te faltan campos por rellenar',
    });
  }
});

//
server.put('/recetas/:id', async (req, res) => {
  const recipeId = req.params.id;
  try {
    const { nameFront, ingFront, instrFront } = req.body;
    const update =
      'UPDATE recetas SET nombre = ?, ingredientes = ?, instrucciones = ? WHERE id = ?';
    const connection = await getConnection();
    const [result] = await connection.query(update, [
      nameFront,
      ingFront,
      instrFront,
      recipeId,
    ]);
    connection.end();
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
    });
  }
});

//
server.delete('/recetas/:id', async (req, res) => {
  const deleteRecipe = req.params.id;
  try {
    const deleteSql = 'DELETE FROM recetas WHERE id = ?';
    const connection = await getConnection();
    const [result] = await connection.query(deleteSql, deleteRecipe);
    connection.end();
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error,
    });
  }
});

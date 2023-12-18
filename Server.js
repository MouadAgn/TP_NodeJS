const cors = require('cors');
const fs = require('fs');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());

app.use(bodyParser.json());

const port = 3000;


// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',      // Database host
  user: 'root',   // Your database username
  password: 'CdEkE0?8', // Your database password
  database: 'tp_nodejs', // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get the promise-based API
const promisePool = pool.promise();

// const sql = 'SELECT * FROM technologie';

// // Use the promise pool to execute queries
// promisePool.query(sql)
//   .then(([rows, fields]) => {
//     console.log('Query result:', rows);
//   })
//   .catch((error) => {
//     console.error('Error executing query:', error);
//   })
//   .finally(() => {
//     // Release the connection
//     pool.end();
//   });


// Create
app.post('/addutilisateur', async (req, res) => {
  try {
    const { nom, prenom, email } = req.body;
    const [result] = await promisePool.query('INSERT INTO utilisateur (nom, prenom, email) VALUES (?, ?, ?)', [nom, prenom, email]);
    res.json({ nom, prenom, email });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.get('/utilisateurs', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM utilisateur');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/utilisateurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await promisePool.query('SELECT * FROM utilisateur WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/utilisateurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email } = req.body;
    await promisePool.query('UPDATE utilisateur SET nom = ?, prenom = ?, email = ? WHERE id = ?', [nom, prenom, email, id]);
    res.json({ id, nom, prenom, email });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({error: 'Erreur serveur' });
  }
});

app.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await promisePool.query('DELETE FROM utilisateur WHERE id = ?', [id]);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// CREATE - Créer un commentaire pour une technologie
app.post('/commentaire', async (req, res) => {
  try {
    const { technologie_id, contenue, utilisateur_id } = req.body;
    console.log(utilisateur_id)
    const [result] = await promisePool.query('INSERT INTO commentaire (date_creation_commentaire, technologie_id, contenue, utilisateur_id) VALUES (NOW(), ?, ?, ?)', [technologie_id, contenue, utilisateur_id]);
    res.json({ date_creation_commentaire: new Date() , technologie_id, contenue, utilisateur_id});
  } catch (error) {
    console.error('Erreur lors de la création du commentaire :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// READ - Récupérer tous les commentaires d'une technologie
app.get('/technologies/:technologie_id/commentaires', async (req, res) => {
  try {
    const { technologie_id } = req.params;
    const [rows] = await promisePool.query('SELECT * FROM commentaire WHERE technologie_id = ?', [technologie_id]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires de la technologie :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// READ - Récupérer tous les commentaires d'un utilisateur
app.get('/utilisateurs/:utilisateur_id/commentaires', async (req, res) => {
  try {
    const { utilisateur_id } = req.params;
    const [rows] = await promisePool.query('SELECT * FROM commentaire WHERE utilisateur_id = ?', [utilisateur_id]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// READ - Récupérer les commentaires antérieurs à une date spécifiée
app.get('/commentaires/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const [rows] = await promisePool.query('SELECT * FROM commentaire WHERE date_creation_commentaire < ?', [date]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires antérieurs à la date spécifiée :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
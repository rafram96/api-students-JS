const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const db = require('./db');

const app = express();
const port = 8001;

// Middlewares
app.use(bodyParser.json()); // para JSON
app.use(bodyParser.urlencoded({ extended: true })); // para x-www-form-urlencoded
const upload = multer(); // para form-data sin archivos

// Rutas para /students
app.route('/students')
  .get((req, res) => {
    db.all("SELECT * FROM students", [], (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json(rows);
    });
  })
  .post(upload.none(), (req, res) => {
    const { firstname, lastname, gender, age } = req.body;

    if (!firstname || !lastname || !gender || age == null) {
      return res.status(400).send("Missing required fields");
    }

    const sql = `INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)`;
    db.run(sql, [firstname, lastname, gender, age], function (err) {
      if (err) return res.status(500).send(err.message);
      res.send(`Student with id: ${this.lastID} created successfully`);
    });
  });

// Rutas para /student/:id
app.route('/student/:id')
  .get((req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM students WHERE id = ?", [id], (err, row) => {
      if (err) return res.status(500).send(err.message);
      if (row) res.json(row);
      else res.status(404).send("Student not found");
    });
  })
  .put(upload.none(), (req, res) => {
    const { firstname, lastname, gender, age } = req.body;
    const id = req.params.id;

    if (!firstname || !lastname || !gender || age == null) {
      return res.status(400).send("Missing required fields");
    }

    const sql = `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`;
    db.run(sql, [firstname, lastname, gender, age, id], function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({ id, firstname, lastname, gender, age });
    });
  })
  .delete((req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM students WHERE id = ?", [id], function (err) {
      if (err) return res.status(500).send(err.message);
      res.send(`The student with id: ${id} has been deleted.`);
    });
  });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// BD en archivo dentro del contenedor (sin volúmenes)
const db = new sqlite3.Database("./app.db");

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Insert inicial si la tabla está vacía
  db.get("SELECT COUNT(*) AS count FROM messages", (err, row) => {
    if (!err && row.count === 0) {
      db.run("INSERT INTO messages(text) VALUES (?)", ["Hola mundo desde SQLite 👋"]);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hola mundo 👋 (usa /messages para ver la BD)");
});

app.get("/messages", (req, res) => {
  db.all("SELECT id, text, created_at FROM messages ORDER BY id ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/messages", (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Campo 'text' requerido (string)." });
  }

  db.run("INSERT INTO messages(text) VALUES (?)", [text], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get(
      "SELECT id, text, created_at FROM messages WHERE id = ?",
      [this.lastID],
      (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json(row);
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`API lista en http://localhost:${PORT}`);
});

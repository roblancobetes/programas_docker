const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// En Compose, el hostname de la DB es el nombre del servicio: "db"
const pool = new Pool({
  host: process.env.PGHOST || "db",
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "appdb",
});

// Crear tabla si no existe
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
init().catch((e) => console.error("Init error:", e));

app.get("/", (req, res) => res.send("API OK. Usa /messages"));

app.get("/messages", async (req, res) => {
  try {
    const r = await pool.query("SELECT id, text, created_at FROM messages ORDER BY id ASC");
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/messages", async (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Campo 'text' requerido (string)." });
  }
  try {
    const r = await pool.query(
      "INSERT INTO messages(text) VALUES ($1) RETURNING id, text, created_at",
      [text]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`API en http://localhost:${PORT}`));

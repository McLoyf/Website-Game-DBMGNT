import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "https://mcloyf.github.io",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(bodyParser.json());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE || "railway",
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("Connecting to MySQL…");

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL Connected");
    connection.release();
  } catch (err) {
    console.error("MySQL connection error:", err);
  }
})();

app.post("/api/score", async (req, res) => {
  try {
    const { username, score } = req.body;
    if (!username || !score) {
      return res.status(400).json({ error: "Missing username or score" });
    }

    console.log("Looking up user:", username);
    const [rows] = await pool.query("SELECT UserID FROM user WHERE Username = ?", [username]);

    if (!rows || rows.length === 0) {
      console.log("User not found:", username);
      return res.status(404).json({ error: "User not found" });
    }

    const userId = rows[0].UserID;
    console.log("Found UserID:", userId);

    await pool.query(
      "INSERT INTO gamesession (UserID, FinalScore, TimePlayed, DatePlayed) VALUES (?, ?, NOW(), NOW())",
      [userId, score]
    );

    console.log("Score inserted successfully!");
    res.json({ message: "Score saved!" });
  } catch (err) {
    console.error("CRASH IN /api/score:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/scores", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.Username, g.FinalScore, g.DatePlayed
       FROM gamesession g
       INNER JOIN user u ON g.UserID = u.UserID
       ORDER BY g.FinalScore DESC
       LIMIT 50`
    );

    res.json(rows);
  } catch (err) {
    console.error("CRASH IN /api/scores:", err);
    res.status(500).json({ error: "Failed to retrieve scores" });
  }
});


app.get("/", (req, res) => {
  res.send("API running! Try POST /api/score");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

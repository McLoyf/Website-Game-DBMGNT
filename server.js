import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// ✅ Port auto-detected by Railway, fallback for local dev
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors({
  origin: ["https://mcloyf.github.io"], // ✅ allow only your GitHub Pages domain
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE || "railway",
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

console.log("✅ MySQL pool created");

pool.connect(err => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// ✅ API: Add a new game score
app.post("/api/score", async (req, res) => {
  try {
    const { username, score } = req.body;
    const [rows] = await pool.query(
      "SELECT UserID FROM user WHERE Username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = rows[0].UserID;
    await pool.query(
      "INSERT INTO gamesession (UserID, FinalScore, TimePlayed, DatePlayed) VALUES (?, ?, NOW(), NOW())",
      [userId, score]
    );

    res.json({ message: "✅ Score saved!" });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
});


// ✅ Helper: save the game session
function saveGame(userId, score, res) {
  const insertGame =
    "INSERT INTO gamesession (UserID, FinalScore, TimePlayed, DatePlayed) VALUES (?, ?, NOW(), NOW())";

  pool.query(insertGame, [userId, score], err => {
    if (err) {
      console.error("❌ Game insert failed:", err);
      return res.status(500).json({ error: "Game insert failed" });
    }
    res.json({ message: "✅ Score saved!" });
  });
}

// ✅ API: Get top 10 scores
app.get("/api/scores", (req, res) => {
  const sql = `
    SELECT u.Username, g.FinalScore, g.DatePlayed
    FROM gamesession g
    JOIN user u ON g.UserID = u.UserID
    ORDER BY g.FinalScore DESC
    LIMIT 10
  `;
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Fetch failed:", err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json(results);
  });
});

// ✅ Serve index.html locally (optional)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
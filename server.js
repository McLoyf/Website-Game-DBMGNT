// server.js
import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Allow CORS from your GitHub Pages site
app.use(
  cors({
    origin: "https://mcloyf.github.io",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// ✅ Middleware
app.use(bodyParser.json());
app.use(express.json());

// ✅ Directory handling (so Express can find index.html if needed)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// ✅ Database connection (Railway variables)
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

console.log("✅ Connecting to MySQL…");

// ✅ Test connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Connected");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
  }
})();

// ✅ POST /api/score endpoint
app.post("/api/score", async (req, res) => {
  console.log("📩 /api/score hit!");

  try {
    const { username, score } = req.body;
    if (!username || !score) {
      return res.status(400).json({ error: "Missing username or score" });
    }

    console.log("🔍 Looking up user:", username);
    const [rows] = await pool.query("SELECT UserID FROM user WHERE Username = ?", [username]);

    if (!rows || rows.length === 0) {
      console.log("❌ User not found:", username);
      return res.status(404).json({ error: "User not found" });
    }

    const userId = rows[0].UserID;
    console.log("🎯 Found UserID:", userId);

    await pool.query(
      "INSERT INTO gamesession (UserID, FinalScore, TimePlayed, DatePlayed) VALUES (?, ?, NOW(), NOW())",
      [userId, score]
    );

    console.log("✅ Score inserted successfully!");
    res.json({ message: "✅ Score saved!" });
  } catch (err) {
    console.error("🔥 CRASH IN /api/score:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Simple test route (optional)
app.get("/", (req, res) => {
  res.send("🎮 API running! Try POST /api/score");
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

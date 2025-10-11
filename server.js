import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const res = await fetch(
  "https://website-game-dbmgnt-production.up.railway.app/api/score",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, score })
  }
);

// --- Middleware ---
app.use(cors({
  origin: ["https://mcloyf.github.io"], // ✅ your GitHub Pages domain
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.options("*", cors());

// --- MySQL Pool ---
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

// --- Test connection once ---
try {
  const conn = await pool.getConnection();
  console.log("✅ MySQL pool connected");
  conn.release();
} catch (err) {
  console.error("❌ MySQL connection error:", err);
}

// --- API endpoint ---
app.post("/api/score", async (req, res) => {
  try {
    const { username, score } = req.body;

    // 1. Find user
    const [rows] = await pool.query("SELECT UserID FROM user WHERE Username = ?", [username]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = rows[0].UserID;

    // 2. Insert score
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

// --- Serve index.html for root ---
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
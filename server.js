import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- ✅ 1. CORS CONFIG (MUST BE FIRST) ----------
app.use(cors({
  origin: "https://mcloyf.github.io", // your GitHub Pages site
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

// Handle all preflight requests explicitly
app.options("/*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://mcloyf.github.io");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(204);
});

// ---------- ✅ 2. BODY PARSER ----------
app.use(bodyParser.json());

// ---------- ✅ 3. PATH SETUP ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- ✅ 4. MYSQL POOL ----------
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

// ---------- ✅ 5. API ROUTE ----------
app.post("/api/score", async (req, res) => {
  console.log("📩 /api/score hit!");

  try {
    console.log("🧠 Request body:", req.body);

    const { username, score } = req.body;
    if (!username || !score) {
      console.log("❌ Missing username or score");
      return res.status(400).json({ error: "Missing username or score" });
    }

    console.log("🔍 Querying user:", username);
    const [rows] = await pool.query("SELECT UserID FROM user WHERE Username = ?", [username]);
    console.log("✅ Query result:", rows);

    if (!rows || rows.length === 0) {
      console.log("❌ No user found for:", username);
      return res.status(404).json({ error: "User not found" });
    }

    const userId = rows[0].UserID;
    console.log("🎯 Found UserID:", userId);

    console.log("💾 Inserting new score record...");
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


// ---------- ✅ 6. STATIC + ROOT ----------
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ---------- ✅ 7. START SERVER ----------
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
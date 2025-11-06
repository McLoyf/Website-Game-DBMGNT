import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "https://mcloyf.github.io"], // adjust for your dev + prod
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(bodyParser.json());
app.use(express.json());

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// MySQL connection
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "web_game",
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verify connection
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL Connected");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
  }
})();

/* ==============================
   REGISTER
============================== */
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO user (FirstName, LastName, Username, PasswordHash, Email, JoinDate)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [firstName, lastName, username, hashedPassword, email]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Username already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/* ==============================
   LOGIN
============================== */
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM user WHERE Username = ?", [username]);

    if (rows.length === 0)
      return res.status(401).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, rows[0].PasswordHash);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    res.json({ message: "Login successful", user: { username } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ==============================
   SCORE SUBMISSION
============================== */
app.post("/api/score", async (req, res) => {
  try {
    const { username, score, level = 0, lines = 0 } = req.body;

    if (!username || score == null)
      return res.status(400).json({ error: "Missing username or score" });

    const [users] = await pool.query(
      "SELECT UserID FROM `user` WHERE Username = ?",
      [username]
    );
    if (users.length === 0)
      return res.status(404).json({ error: "User not found" });

    const userId = users[0].UserID;

    await pool.query(
      "INSERT INTO `gamesession` (UserID, FinalScore, LevelReached, LinesCleared, TimePlayed, DatePlayed) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [userId, score, level, lines]
    );

    res.json({ message: "Score saved!" });
  } catch (err) {
    console.error("❌ Error in /api/score:", err);
    res.status(500).json({ error: "Failed to save score" });
  }
});

/* ==============================
   LEADERBOARD
============================== */
app.get("/api/leaderboard", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         ROW_NUMBER() OVER (ORDER BY g.FinalScore DESC) AS RankPos,
         u.Username AS Player,
         g.FinalScore AS Score,
         g.LevelReached AS Level,
         g.LinesCleared AS Lines,
         DATE_FORMAT(g.DatePlayed, '%Y-%m-%d %H:%i') AS PlayedAt
       FROM gamesession g
       JOIN user u ON g.UserID = u.UserID
       ORDER BY g.FinalScore DESC
       LIMIT 25`
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error in /api/leaderboard:", err);
    res.status(500).json({ error: "Failed to retrieve leaderboard" });
  }
});

app.get("/", (req, res) => {
  res.send("API running — try /api/register, /api/login, /api/score, or /api/leaderboard");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

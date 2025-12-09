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
    origin: "https://mcloyf.github.io",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
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
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL Connected");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
  }
})();

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

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM user WHERE Username = ?",
      [username]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, rows[0].PasswordHash);
    if (!valid)
      return res.status(401).json({ error: "Invalid password" });

    res.json({ message: "Login successful", user: { username } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/score", async (req, res) => {
  try {
    const { username, score, level = 0, lines = 0 } = req.body;

    if (!username || score == null)
      return res.status(400).json({ error: "Missing username or score" });

    const [users] = await pool.query(
      "SELECT UserID FROM user WHERE Username = ?",
      [username]
    );
    if (users.length === 0)
      return res.status(404).json({ error: "User not found" });

    const userId = users[0].UserID;

    await pool.query(
      `INSERT INTO gamesession 
       (UserID, FinalScore, LevelReached, LinesCleared, TimePlayed, DatePlayed)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [userId, score, level, lines]
    );

    res.json({ message: "Score saved!" });
  } catch (err) {
    console.error("❌ Error in /api/score:", err);
    res.status(500).json({ error: "Failed to save score" });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    await pool.query("SET @r := 0");

    const [rows] = await pool.query(
      `SELECT
          @r := @r + 1 AS RankPos,
          u.Username AS Player,
          g.FinalScore AS Score,
          g.LevelReached AS Level,
          g.LinesCleared AS LinesClearedValue,
          DATE_FORMAT(g.DatePlayed, '%Y-%m-%d %H:%i') AS PlayedAt
       FROM gamesession g
       JOIN user u ON g.UserID = u.UserID
       ORDER BY g.FinalScore DESC
       LIMIT 25;`
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ /api/leaderboard error:", err);
    res.status(500).json({ error: "Failed to retrieve leaderboard" });
  }
});

app.post("/api/score/update", async (req, res) => {
  try {
    const { username, score, level = 0, lines = 0 } = req.body;

    if (!username || score == null) {
      console.warn("⚠ Missing username or score");
      return res.json({ message: "Invalid score submission" });
    }

    // find user
    const [users] = await pool.query(
      "SELECT UserID FROM user WHERE Username = ?",
      [username]
    );

    if (users.length === 0) {
      console.warn("⚠ User not found for score update:", username);
      return res.json({ message: "User not found" });
    }

    const userId = users[0].UserID;

    // get highest previous score
    const [rows] = await pool.query(
      "SELECT SessionID, FinalScore FROM gamesession WHERE UserID = ? ORDER BY FinalScore DESC LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      // first score ever → insert
      await pool.query(
        `INSERT INTO gamesession
         (UserID, FinalScore, LevelReached, LinesCleared, TimePlayed, DatePlayed)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [userId, score, level, lines]
      );

      return res.json({ message: "First score saved!" });
    }

    const best = rows[0];

    // update only if new score is better
    if (score > best.FinalScore) {
      await pool.query(
        `UPDATE gamesession
         SET FinalScore = ?, LevelReached = ?, LinesCleared = ?, DatePlayed = NOW()
         WHERE SessionID = ?`,
        [score, level, lines, best.SessionID]
      );

      return res.json({ message: "High score updated!" });
    }

    return res.json({ message: "Score not higher — no update made." });

  } catch (err) {
    console.error("❌ /api/score/update internal error (non-fatal):", err);
    res.json({ message: "Score update skipped due to server issue" });
  }
});


app.delete("/api/score/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { username } = req.body;

    if (!username)
      return res.status(400).json({ error: "Missing username" });

    const [users] = await pool.query(
      "SELECT UserID FROM user WHERE Username = ?",
      [username]
    );
    if (users.length === 0)
      return res.status(404).json({ error: "User not found" });

    const userId = users[0].UserID;

    const [rows] = await pool.query(
      "SELECT * FROM gamesession WHERE SessionID = ? AND UserID = ?",
      [sessionId, userId]
    );

    if (rows.length === 0)
      return res.status(403).json({ error: "Score does not belong to this user" });

    await pool.query(
      "DELETE FROM gamesession WHERE SessionID = ?",
      [sessionId]
    );

    res.json({ message: "Score deleted!" });

  } catch (err) {
    console.error("❌ DELETE /api/score/:sessionId error:", err);
    res.status(500).json({ error: "Failed to delete score" });
  }
});


app.post("/api/user/scores", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username)
      return res.status(400).json({ error: "Missing username" });

    const [users] = await pool.query(
      "SELECT UserID FROM user WHERE Username = ?",
      [username]
    );
    if (users.length === 0)
      return res.status(404).json({ error: "User not found" });

    const userId = users[0].UserID;

    const [scores] = await pool.query(
      `SELECT 
         SessionID,
         FinalScore,
         LevelReached,
         LinesCleared,
         DATE_FORMAT(DatePlayed, '%Y-%m-%d %H:%i') AS DatePlayed
       FROM gamesession
       WHERE UserID = ?
       ORDER BY FinalScore DESC`,
      [userId]
    );

    res.json(scores);

  } catch (err) {
    console.error("❌ /api/user/scores error:", err);
    res.status(500).json({ error: "Failed to load score history" });
  }
});



app.get("/", (req, res) => {
  res.send("API running — try /api/register, /api/login, /api/score, /api/leaderboard");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

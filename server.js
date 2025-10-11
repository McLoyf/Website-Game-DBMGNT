import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// ✅ Port auto-detected by Railway, fallback for local dev
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ MySQL Connection (uses Railway env vars if present)
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "mysql.railway.internal",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "MaRdfDGiAsPZMxQktahxXXNpfNWdUkZN",
  database: process.env.MYSQLDATABASE || "railway",
  port: process.env.MYSQLPORT || 3306,
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// ✅ API: Add a new game score
app.post("/api/score", (req, res) => {
  const { username, score } = req.body;

  if (!username || !score) {
    return res.status(400).json({ error: "Missing username or score" });
  }

  // Step 1: find user by username
  const findUser = "SELECT UserID FROM user WHERE Username = ?";
  db.query(findUser, [username], (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Step 2: auto-create user if not found
    if (result.length === 0) {
      const createUser =
        "INSERT INTO user (Username, JoinDate, PasswordHash, Email) VALUES (?, NOW(), '', '')";
      db.query(createUser, [username], (err2, insertResult) => {
        if (err2) {
          console.error("❌ User creation failed:", err2);
          return res.status(500).json({ error: "User creation failed" });
        }

        const newUserId = insertResult.insertId;
        saveGame(newUserId, score, res);
      });
    } else {
      const userId = result[0].UserID;
      saveGame(userId, score, res);
    }
  });
});

// ✅ Helper: save the game session
function saveGame(userId, score, res) {
  const insertGame =
    "INSERT INTO gamesession (UserID, FinalScore, TimePlayed, DatePlayed) VALUES (?, ?, NOW(), NOW())";

  db.query(insertGame, [userId, score], err => {
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
  db.query(sql, (err, results) => {
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
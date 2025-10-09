import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000;

// middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password", // <-- your MySQL root password
  database: "web_game"
});

db.connect(err => {
  if (err) console.error("❌ MySQL connection error:", err);
  else console.log("✅ MySQL Connected");
});

// --- API ROUTES COME FIRST ---
app.post("/api/score", (req, res) => {
  const { username, score } = req.body;
  if (!username || !score) {
    return res.status(400).json({ error: "Missing username or score" });
  }

  // find user ID
  const findUser = "SELECT UserID FROM user WHERE Username = ?";
  db.query(findUser, [username], (err, result) => {
    if (err) {
      console.error("Find user error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = result[0].UserID;
    const insert =
      "INSERT INTO gamesession (UserID, FinalScore, TimePlayed, DatePlayed) VALUES (?, ?, NOW(), NOW())";

    db.query(insert, [userId, score], err2 => {
      if (err2) {
        console.error("Insert error:", err2);
        return res.status(500).json({ error: "Insert failed" });
      }
      res.json({ message: "✅ Score saved!" });
    });
  });
});

app.get("/api/scores", (req, res) => {
  const sql = `
    SELECT u.Username, g.FinalScore, g.DatePlayed
    FROM gamesession g
    JOIN user u ON g.UserID = u.UserID
    ORDER BY g.FinalScore DESC
    LIMIT 10
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database fetch failed" });
    res.json(results);
  });
});

// --- STATIC FILES AFTER API ROUTES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// fallback route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
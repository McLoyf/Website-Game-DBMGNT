import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "web_game"
})

db.connect(err => {
    if(err) throw err;
    console.log("MySQL Connected");
});

app.post("/api/score", (req,res) => {
    const {username, score} = req.body;
    const sql = "INSERT INTO gamesession (SessionID, UserID, FinalScore, TimePlayed, DatePlayed) VALUES (?, ?, Now())";
    db.query(sql, [username, score], err => {
        if (err) return res.status(500),json({error:err.message});
        res.json({message: "Score saved!"});
    });
});

app.get("/api/scores", (req, res) => {
  db.query("SELECT Username, Score FROM gamesession ORDER BY Score DESC LIMIT 10", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/", (req,res) => {
  res.send("Server is running! User /api/scores or /api/scpre for data.");
})
//http://127.0.0.1:3001/index.html?serverWindowId=da0f2182-0800-4669-a91e-9b2f4fb7879e
app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
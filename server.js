import express from "express";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
    if (!username || score === undefined || score === null) {
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
       LIMIT 25`
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

// Register new user
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [exists] = await pool.query("SELECT * FROM user WHERE Username = ?", [username]);
    if (exists.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const encryptedEmail = encryptAES(email);

    await pool.query(
      "INSERT INTO user (Username, PasswordHash, Email, JoinDate) VALUES (?, ?, ?, NOW())",
      [username, passwordHash, encryptedEmail]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login existing user
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM user WHERE Username = ?", [username]);

    if (!rows || rows.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!isMatch)
      return res.status(401).json({ error: "Incorrect password" });

    // Decrypt email before sending
    const decryptedEmail = user.Email ? decryptAES(user.Email) : null;

    res.json({
      message: "Login successful",
      user: { username: user.Username, email: decryptedEmail },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const AES_KEY = process.env.AES_KEY; // 32 bytes
const AES_IV = crypto.randomBytes(16);

function encryptAES(text) {
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(AES_KEY, "utf8"), AES_IV);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return `${AES_IV.toString("base64")}:${encrypted}`; // store IV + ciphertext
}

function decryptAES(data) {
  const [ivBase64, encrypted] = data.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(AES_KEY, "utf8"), iv);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// scripts/register.js

const BACKEND_URL = "https://website-game-dbmgnt-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  // Handle registration form
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const firstName = document.getElementById("firstName")?.value || "";
      const lastName = document.getElementById("lastName")?.value || "";
      const email = document.getElementById("email")?.value || "";
      const username = document.getElementById("username")?.value || "";
      const password = document.getElementById("password")?.value || "";

      app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;
    console.log("Received registration data:", req.body); // 🟢 Log the incoming payload

    if (!username || !password || !email) {
      console.log("❌ Missing required fields:", req.body);
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Inserting new user into database...");
    await pool.query(
      `INSERT INTO user (FirstName, LastName, Username, PasswordHash, Email, JoinDate)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [firstName, lastName, username, hashedPassword, email]
    );

    console.log("✅ User registered successfully:", username);
    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error("🔥 Registration error:", err); // 🟢 Full error details
    res.status(500).json({ error: err.message });
  }
});
    });
  }

  // Handle login form
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username")?.value || "";
      const password = document.getElementById("password")?.value || "";

      try {
        const res = await fetch(`${BACKEND_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        const output = document.getElementById("output");

        if (res.ok) {
          output.textContent = "✅ Login successful!";
          output.style.color = "lightgreen";
          // redirect or store token here if needed
        } else {
          output.textContent = `❌ ${data.error || "Invalid credentials."}`;
          output.style.color = "red";
        }
      } catch (err) {
        console.error("Login error:", err);
        document.getElementById("output").textContent = "❌ Connection error.";
      }
    });
  }
});

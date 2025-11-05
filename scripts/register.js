// ----------------Register------------------
const BACKEND_URL = "https://website-game-dbmgnt-production.up.railway.app"; 

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const output = document.getElementById("output");

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }

  async function handleRegister(e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName")?.value || "";
    const lastName = document.getElementById("lastName")?.value || "";
    const username = document.getElementById("username")?.value || "";
    const email = document.getElementById("email")?.value || "";
    const password = document.getElementById("password")?.value || "";

    if (!firstName || !lastName || !username || !email || !password) {
      output.textContent = "⚠️ Please fill out all fields.";
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        output.textContent = `❌ ${data.error || "Registration failed"}`;
        return;
      }

      output.textContent = "✅ Registration successful! Redirecting to login...";
      localStorage.setItem("username", username);

      setTimeout(() => {
        window.location.href = "./login.html";
      }, 1500);
    } catch (err) {
      console.error("Error registering:", err);
      output.textContent = "❌ Server error during registration.";
    }
  }
});

// ---------Login---------
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const output = document.getElementById("output");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("username")?.value || "";
    const password = document.getElementById("password")?.value || "";

    if (!username || !password) {
      output.textContent = "⚠️ Please enter both username and password.";
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        output.textContent = `❌ ${data.error || "Login failed"}`;
        return;
      }

      // Store username in localStorage for use in the game
      localStorage.setItem("username", username);
      output.textContent = "✅ Login successful! Redirecting...";

      setTimeout(() => {
        window.location.href = "../index.html"; // redirect to home or game page
      }, 1500);
    } catch (err) {
      console.error("Error logging in:", err);
      output.textContent = "❌ Server error during login.";
    }
  }
});

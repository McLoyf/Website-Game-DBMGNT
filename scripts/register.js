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

      try {
        const res = await fetch(`${BACKEND_URL}/api/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, username, password }),
        });

        const data = await res.json();
        const output = document.getElementById("output");

        if (res.ok) {
          output.textContent = "✅ Registration successful! You can now log in.";
          output.style.color = "lightgreen";
        } else {
          output.textContent = `❌ Error: ${data.error || "Something went wrong."}`;
          output.style.color = "red";
        }
      } catch (err) {
        console.error("Registration error:", err);
        document.getElementById("output").textContent = "❌ Connection error.";
      }
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

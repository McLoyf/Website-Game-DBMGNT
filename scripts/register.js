// scripts/register.js
const BACKEND_URL = "https://website-game-dbmgnt-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  // 🟢 SIGNUP HANDLER
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();


      const firstName = document.getElementById("firstName")?.value || "";
      const lastName  = document.getElementById("lastName")?.value || "";
      const email     = document.getElementById("email")?.value || "";
      const username  = document.getElementById("username")?.value || "";
      const password  = document.getElementById("password")?.value || "";

      const output = document.getElementById("output");

      try {
        const response = await fetch(`${BACKEND_URL}/api/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, username, password }),
        });

        const data = await response.json();

        if (response.ok) {
          output.textContent = "✅ Registration successful! You can now log in.";
          output.style.color = "lightgreen";
        } else {
          output.textContent = `❌ Error: ${data.error || "Something went wrong"}`;
          output.style.color = "red";
        }
      } catch (error) {
        console.error("Registration error:", error);
        output.textContent = "❌ Connection error. Try again later.";
        output.style.color = "red";
      }
    });
  }

  // 🟢 LOGIN HANDLER
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const username = document.getElementById("username")?.value.trim();
      const password = document.getElementById("password")?.value.trim();
      const output = document.getElementById("output");

      try {
        const response = await fetch(`${BACKEND_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
          output.textContent = "✅ Login successful!";
          output.style.color = "lightgreen";
          localStorage.setItem("username", username);
          // You can redirect if needed:
          // window.location.href = "../game/index.html";
        } else {
          output.textContent = `❌ ${data.error || "Invalid credentials"}`;
          output.style.color = "red";
        }
      } catch (error) {
        console.error("Login error:", error);
        output.textContent = "❌ Connection error. Try again later.";
        output.style.color = "red";
      }
    });
  }
});

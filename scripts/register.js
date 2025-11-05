'use strict';

const API_BASE = "https://website-game-dbmgnt-production.up.railway.app"; // Use your local dev server URL for testing

function showOutput(message, color = "white") {
  const output = document.getElementById("output");
  if (output) {
    output.textContent = message;
    output.style.color = color;
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");
  const emailEl = document.getElementById("email");
  const firstNameEl = document.getElementById("firstName");
  const lastNameEl = document.getElementById("lastName");

  const username = usernameEl ? usernameEl.value.trim() : "";
  const password = passwordEl ? passwordEl.value.trim() : "";
  const email = emailEl ? emailEl.value.trim() : "";
  const firstName = firstNameEl ? firstNameEl.value.trim() : "";
  const lastName = lastNameEl ? lastNameEl.value.trim() : "";

  if (!username || !password || !email) {
    showOutput("Please fill in all required fields.", "red");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email, firstName, lastName }),
    });

    const data = await response.json();

    if (response.ok) {
      showOutput("Registration successful! Redirecting...", "lightgreen");
      setTimeout(() => {
        window.location.href = "./login.html";
      }, 1500);
    } else {
      showOutput(data.error || "Registration failed.", "red");
    }
  } catch (err) {
    console.error(err);
    showOutput("An error occurred during registration.", "red");
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");

  const username = usernameEl ? usernameEl.value.trim() : "";
  const password = passwordEl ? passwordEl.value.trim() : "";

  if (!username || !password) {
    showOutput("Enter both username and password.", "red");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showOutput("Login successful! Redirecting...", "lightgreen");
      localStorage.setItem("username", username);
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1500);
    } else {
      showOutput(data.error || "Invalid username or password.", "red");
    }
  } catch (err) {
    console.error(err);
    showOutput("An error occurred during login.", "red");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  if (registerForm) registerForm.addEventListener("submit", handleRegister);
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
});

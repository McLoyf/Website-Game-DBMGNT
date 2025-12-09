const username = localStorage.getItem("username");
const BACKEND_URL = "https://website-game-dbmgnt-production.up.railway.app";

const userDisplay = document.getElementById("userDisplay");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const scoreTableBody = document.getElementById("scoreTableBody");

// Redirect if not logged in
if (!username) window.location.href = "./login.html";

userDisplay.textContent = "Logged in as: " + username;
logoutBtn.style.display = "inline-block";

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "../index.html";
});

async function loadScores() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/user/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });

    const scores = await res.json(); // <-- THIS defines "scores"

    scoreTableBody.innerHTML = ""; // Clear previous items

    if (!Array.isArray(scores) || scores.length === 0) {
      scoreTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; opacity:0.6;">
            No scores yet.
          </td>
        </tr>`;
      return;
    }

    scores.forEach(row => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${row.FinalScore}</td>
        <td>${row.LevelReached}</td>
        <td>${row.LinesCleared}</td>
        <td>${row.DatePlayed}</td>
        <td>
          <button class="button deleteScoreBtn" data-id="${row.SessionID}">
            Delete
          </button>
        </td>
      `;

      scoreTableBody.appendChild(tr);
    });

    // Attach delete events
    document.querySelectorAll(".deleteScoreBtn").forEach(btn => {
      btn.addEventListener("click", deleteScore);
    });

  } catch (err) {
    console.error("❌ Error loading score history:", err);
  }
}

async function deleteScore(event) {
  const sessionId = event.target.dataset.id;

  if (!confirm("Delete this score?")) return;

  const res = await fetch(`${BACKEND_URL}/api/score/${sessionId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });

  const data = await res.json();
  alert(data.message);

  loadScores();
}




// Basic info for now
userInfo.innerHTML = `
  <p><strong>Username:</strong> ${username}</p>
  <p><strong>Email:</strong> (coming soon)</p>
`;

// // Placeholder scores
// scoreTableBody.innerHTML = `
//   <tr>
//     <td colspan="5" style="text-align:center; opacity: 0.6;">
//       (Score history loading soon...)
//     </td>
//   </tr>
// `;

document.getElementById("updateUsernameBtn").onclick = () =>
  alert("Update username feature coming soon.");
document.getElementById("updateEmailBtn").onclick = () =>
  alert("Update email feature coming soon.");
document.getElementById("updatePasswordBtn").onclick = () =>
  alert("Update password feature coming soon.");

loadScores();
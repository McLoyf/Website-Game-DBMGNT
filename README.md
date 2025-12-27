<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Website-Game-DBMGNT</title>
  <style>
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      line-height: 1.6;
      margin: 40px;
      background: #0f172a;
      color: #e5e7eb;
    }
    h1, h2, h3 {
      color: #93c5fd;
    }
    code, pre {
      background: #020617;
      color: #e5e7eb;
      padding: 6px 8px;
      border-radius: 6px;
    }
    pre {
      padding: 12px;
      overflow-x: auto;
    }
    a {
      color: #60a5fa;
    }
    .note {
      background: #1e293b;
      padding: 12px;
      border-left: 4px solid #38bdf8;
      margin: 16px 0;
    }
    .warn {
      background: #1e293b;
      padding: 12px;
      border-left: 4px solid #f87171;
      margin: 16px 0;
    }
  </style>
</head>
<body>
<h1>Website-Game-DBMGNT</h1>
This project is a website that hosts a tetris game and can update user info on the connected database which is deployed via Railway. The focus of this project is not the game on the site nor the site itself. The game code is a slightly modified version of RosettaCode's javascript implementation of the game <a href="https://rosettacode.org/wiki/Tetris/JavaScript">Tetris</a>. The CSS styling is made by ChatGPT as to save time for the focus of the project; Creating a schema, connnecting the schema to the front end, and manipulating the data in several ways (INSERT, UPDATE, DELETE).

<div class="note">
    Note: UPDATE DML yet to be implemented
</div>


<pre>
<img src="./media/example-game.png" alt="Screenshot of the Tetris web game">
</pre>

<h2>Application Features</h2>

<h3>User</h3>
<p>The user can play a game of Tetris but if not logged in then the game will not save the score. If a user wants their score to be saved then they will need to make an account and login. Once the user logs in they will have access to a user page and their scores will be saved. On the user page they can delete any one of their scores if they so choose to, the user will also be able to logout (of course).
</p>

<h3>Leaderboard</h3> Scores are submitted when a user loses, the score shows the user who achieved the score, the time, lines cleared, level reached, and rank. It shows the top 25 user scores, that means any one user can only have one score on the leaderboard (their top scores)
</p>

<div class="warn">
    This project is a work-in-progress and as such not all desired features may be implemented at the time of reading.
</div>
</body>
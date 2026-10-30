
// NEXORA GAMES - PART 1
// Common setup and games 1-15

const params = new URLSearchParams(window.location.search);
const gameId = params.get("game");

const titleElement = document.getElementById("game-title");
const container = document.getElementById("game-container");
const statusElement = document.getElementById("game-status");
const restartButton = document.getElementById("restart-button");

const gameFunctions = {};

let cleanupGame = null;
let gameTimer = null;

function setStatus(message) {
  statusElement.textContent = message || "";
}

function clearGame() {
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = null;

  if (cleanupGame) cleanupGame();
  cleanupGame = null;

  container.innerHTML = "";
  setStatus("");
}

function makeButton(label, action) {
  const button = document.createElement("button");
  button.textContent = label;
  button.onclick = action;
  button.style.cssText =
    "padding:12px 18px;margin:6px;border:0;border-radius:9px;background:#d6ad55;color:#111;font-weight:bold;cursor:pointer;";
  return button;
}

function makeText(text) {
  const p = document.createElement("p");
  p.textContent = text;
  return p;
}

function makeInput(placeholder = "") {
  const input = document.createElement("input");
  input.placeholder = placeholder;
  input.style.cssText =
    "padding:12px;border-radius:8px;border:1px solid #d6ad55;background:#171717;color:white;margin:6px;max-width:90%;";
  return input;
}

function makeGrid(columns = 3) {
  const grid = document.createElement("div");
  grid.style.cssText =
    `display:grid;grid-template-columns:repeat(${columns},minmax(55px,1fr));gap:8px;max-width:340px;margin:15px auto;`;
  container.appendChild(grid);
  return grid;
}

function gameButton(grid, text, action) {
  const button = makeButton(text, action);
  button.style.cssText +=
    "min-height:65px;font-size:20px;margin:0;";
  grid.appendChild(button);
  return button;
}

// 1. SNAKE
gameFunctions.snake = function () {
  container.innerHTML =
    '<canvas id="snakeCanvas" width="300" height="300" style="max-width:100%;background:#111;border:2px solid #d6ad55;"></canvas>';
  const canvas = document.getElementById("snakeCanvas");
  const ctx = canvas.getContext("2d");

  let snake, food, dx, dy, score, alive;

  function reset() {
    snake = [{ x: 10, y: 10 }];
    food = { x: 5, y: 5 };
    dx = 1;
    dy = 0;
    score = 0;
    alive = true;
    setStatus("Score: 0 — Use arrow keys or buttons.");
  }

  function draw() {
    if (!alive) return;
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, 300, 300);

    ctx.fillStyle = "#d6ad55";
    snake.forEach(p => ctx.fillRect(p.x * 10, p.y * 10, 9, 9));

    ctx.fillStyle = "#ff5555";
    ctx.fillRect(food.x * 10, food.y * 10, 9, 9);

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (
      head.x < 0 || head.x >= 30 ||
      head.y < 0 || head.y >= 30 ||
      snake.some(p => p.x === head.x && p.y === head.y)
    ) {
      alive = false;
      setStatus("Game over! Final score: " + score);
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      food = {
        x: Math.floor(Math.random() * 30),
        y: Math.floor(Math.random() * 30)
      };
      setStatus("Score: " + score);
    } else {
      snake.pop();
    }
  }

  function turn(x, y) {
    if (x !== -dx || y !== -dy) {
      dx = x;
      dy = y;
    }
  }

  function key(e) {
    if (e.key === "ArrowUp") turn(0, -1);
    if (e.key === "ArrowDown") turn(0, 1);
    if (e.key === "ArrowLeft") turn(-1, 0);
    if (e.key === "ArrowRight") turn(1, 0);
  }

  window.addEventListener("keydown", key);
  cleanupGame = () => window.removeEventListener("keydown", key);

  const controls = document.createElement("div");
  container.appendChild(controls);
  [
    ["↑", 0, -1], ["↓", 0, 1],
    ["←", -1, 0], ["→", 1, 0]
  ].forEach(([label, x, y]) => {
    controls.appendChild(makeButton(label, () => turn(x, y)));
  });

  reset();
  gameTimer = setInterval(draw, 130);
};

// 2. MEMORY MATCH
gameFunctions.memory = function () {
  const symbols = ["🍎", "🍌", "🍇", "🍒", "⭐", "🚀", "🎮", "💎"];
  let cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  let first = null, locked = false, moves = 0, matched = 0;

  const grid = makeGrid(4);

  function render() {
    grid.innerHTML = "";
    cards.forEach((symbol, i) => {
      const b = gameButton(grid, "?", () => {
        if (locked || b.dataset.open === "yes") return;
        b.textContent = symbol;
        b.dataset.open = "yes";

        if (first === null) {
          first = { symbol, button: b };
        } else {
          moves++;
          if (first.symbol === symbol) {
            matched += 2;
            first = null;
            setStatus("Moves: " + moves);
            if (matched === cards.length) setStatus("You won in " + moves + " moves!");
          } else {
            locked = true;
            const previous = first.button;
            first = null;
            setTimeout(() => {
              b.textContent = "?";
              previous.textContent = "?";
              b.dataset.open = "";
              previous.dataset.open = "";
              locked = false;
            }, 700);
          }
        }
      });
    });
  }

  render();
  setStatus("Find all matching pairs. Moves: 0");
};

// 3. TIC TAC TOE
gameFunctions.ttt = function () {
  let board = Array(9).fill("");
  let turn = "X";
  let finished = false;
  const grid = makeGrid(3);

  function check() {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (const line of wins) {
      if (line.every(i => board[i] === turn)) {
        finished = true;
        setStatus(turn + " wins!");
        return;
      }
    }
    if (board.every(Boolean)) {
      finished = true;
      setStatus("It's a draw!");
    }
  }

  board.forEach((_, i) => {
    gameButton(grid, "", () => {
      if (finished || board[i]) return;
      board[i] = turn;
      grid.children[i].textContent = turn;
      check();
      if (!finished) {
        turn = turn === "X" ? "O" : "X";
        setStatus("Turn: " + turn);
      }
    });
  });
  setStatus("Turn: X");
};

// 4. ROCK PAPER SCISSORS
gameFunctions.rps = function () {
  let score = 0;
  const choices = ["Rock", "Paper", "Scissors"];
  choices.forEach(choice => {
    container.appendChild(makeButton(choice, () => {
      const computer = choices[Math.floor(Math.random() * 3)];
      let result = "Draw!";
      if (
        (choice === "Rock" && computer === "Scissors") ||
        (choice === "Paper" && computer === "Rock") ||
        (choice === "Scissors" && computer === "Paper")
      ) {
        score++;
        result = "You win!";
      } else if (choice !== computer) {
        result = "Computer wins!";
      }
      setStatus("You: " + choice + " | Computer: " + computer + " | " + result + " Score: " + score);
    }));
  });
};

// 5. 2048
gameFunctions["2048"] = function () {
  let board = Array(16).fill(0);
  const grid = makeGrid(4);

  function addTile() {
    const empty = board.map((v, i) => v === 0 ? i : -1).filter(i => i >= 0);
    if (empty.length) board[empty[Math.floor(Math.random() * empty.length)]] = 2;
  }

  function render() {
    grid.innerHTML = "";
    board.forEach(v => {
      const b = makeButton(v || "", () => {});
      b.style.minHeight = "65px";
      b.style.fontSize = "22px";
      grid.appendChild(b);
    });
  }

  function move(direction) {
    const old = board.join(",");
    for (let r = 0; r < 4; r++) {
      let line = [];
      for (let c = 0; c < 4; c++) {
        const index = direction === "left" || direction === "right"
          ? r * 4 + (direction === "right" ? 3 - c : c)
          : (direction === "down" ? 3 - c : c) * 4 + r;
        line.push(board[index]);
      }
      line = line.filter(Boolean);
      for (let i = 0; i < line.length - 1; i++) {
        if (line[i] === line[i + 1]) {
          line[i] *= 2;
          line.splice(i + 1, 1);
        }
      }
      while (line.length < 4) line.push(0);
      for (let c = 0; c < 4; c++) {
        const index = direction === "left" || direction === "right"
          ? r * 4 + (direction === "right" ? 3 - c : c)
          : (direction === "down" ? 3 - c : c) * 4 + r;
        board[index] = line[c];
      }
    }
    if (old !== board.join(",")) addTile();
    render();
    setStatus("Use the arrow buttons to combine matching numbers.");
  }

  addTile(); addTile(); render();
  ["left", "right", "up", "down"].forEach(d =>
    container.appendChild(makeButton(d.toUpperCase(), () => move(d)))
  );
};

// 6. BREAKOUT
gameFunctions.breakout = function () {
  container.innerHTML =
    '<canvas id="breakCanvas" width="300" height="300" style="max-width:100%;background:#111;border:2px solid #d6ad55"></canvas>';
  const canvas = document.getElementById("breakCanvas");
  const ctx = canvas.getContext("2d");
  let x = 150, y = 240, dx = 3, dy = -3, paddle = 110;
  let score = 0;

  function draw() {
    ctx.clearRect(0, 0, 300, 300);
    ctx.fillStyle = "#d6ad55";
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(i * 58 + 2, 30, 54, 12);
    }
    ctx.fillRect(paddle, 275, 80, 10);
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    x += dx; y += dy;
    if (x < 6 || x > 294) dx *= -1;
    if (y < 6) dy *= -1;
    if (y > 265 && x > paddle && x < paddle + 80) dy *= -1;
    if (y > 300) {
      clearInterval(gameTimer);
      gameTimer = null;
      setStatus("Game over! Score: " + score);
    } else {
      score++;
      setStatus("Score: " + score);
    }
  }

  const controls = document.createElement("div");
  container.appendChild(controls);
  controls.appendChild(makeButton("◀", () => paddle = Math.max(0, paddle - 25)));
  controls.appendChild(makeButton("▶", () => paddle = Math.min(220, paddle + 25)));
  gameTimer = setInterval(draw, 30);
};

// 7. HANGMAN
gameFunctions.hangman = function () {
  const words = ["APPLE", "GAMES", "NEXORA", "PLANET", "ROCKET"];
  const word = words[Math.floor(Math.random() * words.length)];
  let guessed = [];
  let mistakes = 0;

  const display = makeText("");
  container.appendChild(display);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  function render() {
    display.textContent = word.split("").map(c => guessed.includes(c) ? c : "_").join(" ");
    setStatus("Wrong guesses: " + mistakes + "/6");
    if (word.split("").every(c => guessed.includes(c))) setStatus("You won!");
    if (mistakes >= 6) setStatus("Game over! Word: " + word);
  }

  alphabet.forEach(letter => {
    container.appendChild(makeButton(letter, () => {
      if (guessed.includes(letter) || mistakes >= 6 || word.split("").every(c => guessed.includes(c))) return;
      guessed.push(letter);
      if (!word.includes(letter)) mistakes++;
      render();
    }));
  });
  render();
};

// 8. WHACK A MOLE
gameFunctions.mole = function () {
  let score = 0, time = 20, active = -1;
  const grid = makeGrid(3);

  function render() {
    grid.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      gameButton(grid, i === active ? "🐹" : "🕳️", () => {
        if (i === active && time > 0) {
          score++;
          active = -1;
          setStatus("Score: " + score + " | Time: " + time);
        }
      });
    }
  }

  function tick() {
    time--;
    active = Math.floor(Math.random() * 9);
    render();
    setStatus("Score: " + score + " | Time: " + time);
    if (time <= 0) {
      clearInterval(gameTimer);
      gameTimer = null;
      setStatus("Time up! Final score: " + score);
    }
  }

  render();
  gameTimer = setInterval(tick, 1000);
};

// 9. REACTION TEST
gameFunctions.reaction = function () {
  const box = document.createElement("button");
  box.textContent = "Wait for green...";
  box.style.cssText =
    "width:100%;min-height:150px;background:#9b3333;color:white;font-size:22px;border:0;border-radius:12px;";
  container.appendChild(box);

  let ready = false, start = 0, timer;
  box.onclick = () => {
    if (!ready) {
      if (!start) {
        box.textContent = "Wait...";
        timer = setTimeout(() => {
          ready = true;
          start = Date.now();
          box.style.background = "green";
          box.textContent = "TAP NOW!";
        }, 1500 + Math.random() * 3000);
      } else {
        clearTimeout(timer);
        start = 0;
        box.textContent = "Too early! Tap to try again.";
      }
    } else {
      setStatus("Your reaction time: " + (Date.now() - start) + " ms");
      ready = false;
      start = 0;
      box.style.background = "#9b3333";
      box.textContent = "Tap to try again";
    }
  };
  cleanupGame = () => clearTimeout(timer);
};

// 10. MATH QUIZ
gameFunctions.math = function () {
  let score = 0, answer = 0;
  const question = makeText("");
  container.appendChild(question);
  const input = makeInput("Your answer");
  container.appendChild(input);

  const submit = makeButton("Submit", check);
  container.appendChild(submit);

  function next() {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    answer = a + b;
    question.textContent = a + " + " + b + " = ?";
    input.value = "";
  }

  function check() {
    if (Number(input.value) === answer && input.value !== "") {
      score++;
      setStatus("Correct! Score: " + score);
    } else {
      setStatus("Not quite. Try again!");
    }
    next();
  }
  next();
};

// 11. FLAPPY
gameFunctions.flappy = function () {
  container.innerHTML =
    '<canvas id="flappyCanvas" width="300" height="350" style="max-width:100%;background:#182a40;border:2px solid #d6ad55"></canvas>';
  const canvas = document.getElementById("flappyCanvas");
  const ctx = canvas.getContext("2d");
  let bird = 170, velocity = 0, pipe = 300, gap = 110, score = 0, alive = true;

  const flap = () => { if (alive) velocity = -5; };
  canvas.addEventListener("click", flap);
  cleanupGame = () => canvas.removeEventListener("click", flap);

  function draw() {
    if (!alive) return;
    ctx.clearRect(0, 0, 300, 350);
    velocity += 0.25;
    bird += velocity;
    pipe -= 2;

    if (pipe < -45) {
      pipe = 300;
      gap = 80 + Math.random() * 150;
      score++;
    }

    ctx.fillStyle = "#d6ad55";
    ctx.fillRect(pipe, 0, 45, gap);
    ctx.fillRect(pipe, gap + 110, 45, 240);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(70, bird, 10, 0, Math.PI * 2);
    ctx.fill();

    if (bird < 0 || bird > 350 ||
      (pipe < 80 && pipe + 45 > 60 &&
       (bird < gap || bird > gap + 110))) {
      alive = false;
      setStatus("Game over! Score: " + score);
    } else {
      setStatus("Score: " + score + " — Tap the game to flap.");
    }
  }
  gameTimer = setInterval(draw, 30);
};

// 12. CAR RACING
gameFunctions.racing = function () {
  let lane = 1, enemy = Math.floor(Math.random() * 3), score = 0;
  const grid = makeGrid(3);

  function render() {
    grid.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      gameButton(grid, i === lane ? "🚗" : (i === enemy ? "🚙" : "⬛"), () => {
        lane = i;
        if (lane === enemy) {
          clearInterval(gameTimer);
          gameTimer = null;
          setStatus("Crash! Score: " + score);
        }
        render();
      });
    }
  }

  gameTimer = setInterval(() => {
    enemy = Math.floor(Math.random() * 3);
    score++;
    if (lane === enemy) {
      clearInterval(gameTimer);
      gameTimer = null;
      setStatus("Crash! Score: " + score);
    } else {
      setStatus("Score: " + score + " — Move to another lane!");
    }
    render();
  }, 1300);
  render();
};

// 13. PONG
gameFunctions.pong = function () {
  container.innerHTML =
    '<canvas id="pongCanvas" width="300" height="300" style="max-width:100%;background:#111;border:2px solid #d6ad55"></canvas>';
  const canvas = document.getElementById("pongCanvas");
  const ctx = canvas.getContext("2d");
  let ball = { x: 150, y: 150, dx: 3, dy: 3 };
  let paddle = 120, score = 0;

  function draw() {
    ctx.clearRect(0, 0, 300, 300);
    ctx.fillStyle = "#d6ad55";
    ctx.fillRect(paddle, 280, 60, 8);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.x < 6 || ball.x > 294) ball.dx *= -1;
    if (ball.y < 6) ball.dy *= -1;
    if (ball.y > 270 && ball.x > paddle && ball.x < paddle + 60) {
      ball.dy *= -1;
      score++;
    }
    if (ball.y > 300) {
      clearInterval(gameTimer);
      gameTimer = null;
      setStatus("Game over! Score: " + score);
    } else {
      setStatus("Score: " + score);
    }
  }

  const controls = document.createElement("div");
  container.appendChild(controls);
  controls.appendChild(makeButton("◀", () => paddle = Math.max(0, paddle - 20)));
  controls.appendChild(makeButton("▶", () => paddle = Math.min(240, paddle + 20)));
  gameTimer = setInterval(draw, 30);
};

// 14. SUDOKU MINI
gameFunctions.sudoku = function () {
  const solution = [1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1];
  const puzzle = solution.map((v, i) => i % 3 === 0 ? 0 : v);
  const grid = makeGrid(4);

  puzzle.forEach((value, i) => {
    const input = makeInput("?");
    input.type = "number";
    input.min = "1";
    input.max = "4";
    input.style.width = "45px";
    input.value = value || "";
    if (value) input.disabled = true;
    grid.appendChild(input);
  });

  container.appendChild(makeButton("Check answers", () => {
    const inputs = [...grid.querySelectorAll("input")];
    const correct = inputs.every((input, i) => Number(input.value) === solution[i]);
    setStatus(correct ? "Great! Puzzle solved!" : "Some numbers are incorrect. Try again.");
  }));
  setStatus("Fill the empty boxes with numbers 1 to 4.");
};

// 15. WORD GUESS
gameFunctions.word = function () {
  const words = ["APPLE", "TIGER", "MANGO", "CHAIR", "PLANT"];
  const word = words[Math.floor(Math.random() * words.length)];
  let tries = 6;

  const input = makeInput("Enter a 5-letter word");
  input.maxLength = 5;
  container.appendChild(input);

  const output = makeText("");
  container.appendChild(output);

  container.appendChild(makeButton("Guess", () => {
    const guess = input.value.toUpperCase().trim();
    if (guess.length !== 5) {
      setStatus("Enter exactly 5 letters.");
      return;
    }
    tries--;
    if (guess === word) {
      output.textContent = "Correct! " + word;
      setStatus("You won!");
    } else if (tries <= 0) {
      output.textContent = "The word was " + word;
      setStatus("Game over!");
    } else {
      output.textContent = guess.split("").map((c, i) =>
        c === word[i] ? c + " ✓" : word.includes(c) ? c + " •" : c + " ✗"
      ).join("  ");
      setStatus("Attempts left: " + tries);
    }
    input.value = "";
  }));
};

// NEXORA GAMES - PART 2
// Games 16-30 and final game loader

// 16. CONNECT FOUR
gameFunctions.connect4 = function () {
  let board = Array(42).fill("");
  let turn = "🔴";
  let finished = false;
  const grid = makeGrid(7);

  function render() {
    grid.innerHTML = "";
    for (let c = 0; c < 7; c++) {
      gameButton(grid, "↓", () => {
        if (finished) return;
        for (let r = 5; r >= 0; r--) {
          const i = r * 7 + c;
          if (!board[i]) {
            board[i] = turn;
            check();
            if (!finished) turn = turn === "🔴" ? "🟡" : "🔴";
            render();
            return;
          }
        }
      });
    }

    board.forEach((value) => {
      const cell = document.createElement("div");
      cell.textContent = value || "⚪";
      cell.style.cssText =
        "background:#173b75;border-radius:5px;min-height:35px;display:grid;place-items:center;font-size:20px;";
      grid.appendChild(cell);
    });
  }

  function check() {
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        const i = r * 7 + c;
        if (!board[i]) continue;
        for (const [dr, dc] of directions) {
          const cells = [];
          for (let n = 0; n < 4; n++) {
            const rr = r + dr * n;
            const cc = c + dc * n;
            if (rr < 0 || rr >= 6 || cc < 0 || cc >= 7) break;
            cells.push(board[rr * 7 + cc]);
          }
          if (cells.length === 4 && cells.every(v => v === board[i])) {
            finished = true;
            setStatus(turn + " wins!");
            return;
          }
        }
      }
    }
    if (board.every(Boolean)) {
      finished = true;
      setStatus("Draw!");
    } else {
      setStatus("Current turn: " + turn);
    }
  }

  render();
  setStatus("Red starts. Tap a column to drop a disc.");
};

// 17. SIMON SAYS
gameFunctions.simon = function () {
  const colors = ["🔴", "🟢", "🔵", "🟡"];
  let sequence = [];
  let position = 0;
  let accepting = false;
  const grid = makeGrid(2);

  function showSequence() {
    accepting = false;
    position = 0;
    setStatus("Watch the sequence...");
    let i = 0;
    const timer = setInterval(() => {
      setStatus("Remember: " + sequence.slice(0, i + 1).join(" "));
      i++;
      if (i >= sequence.length) {
        clearInterval(timer);
        accepting = true;
        setStatus("Your turn! Repeat the sequence.");
      }
    }, 700);
    cleanupGame = () => clearInterval(timer);
  }

  function nextRound() {
    sequence.push(Math.floor(Math.random() * 4));
    showSequence();
  }

  colors.forEach((color, index) => {
    gameButton(grid, color, () => {
      if (!accepting) return;
      if (sequence[position] !== index) {
        accepting = false;
        setStatus("Wrong! You reached level " + sequence.length);
        return;
      }
      position++;
      if (position === sequence.length) {
        setStatus("Correct! Next level...");
        setTimeout(nextRound, 700);
      }
    });
  });

  nextRound();
};

// 18. JUMPER
gameFunctions.jumper = function () {
  let score = 0;
  let jumping = false;
  const player = makeText("🧍");
  player.style.fontSize = "55px";
  container.appendChild(player);

  const jumpButton = makeButton("JUMP", () => {
    if (jumping) return;
    jumping = true;
    score++;
    player.textContent = "🦘";
    setStatus("Jumps: " + score);
    setTimeout(() => {
      player.textContent = "🧍";
      jumping = false;
    }, 500);
  });
  container.appendChild(jumpButton);
  setStatus("Tap JUMP to jump and score points.");
};

// 19. TYPING SPEED
gameFunctions.typing = function () {
  const sentences = [
    "Nexora Games is awesome",
    "Practice makes you better",
    "Gaming is fun every day",
    "Keep learning and improving"
  ];
  const sentence = sentences[Math.floor(Math.random() * sentences.length)];
  const target = makeText(sentence);
  container.appendChild(target);

  const input = makeInput("Type the sentence here");
  container.appendChild(input);

  const start = Date.now();
  input.addEventListener("input", () => {
    if (input.value === sentence) {
      const seconds = Math.max(1, (Date.now() - start) / 1000);
      const wpm = Math.round((sentence.split(" ").length / seconds) * 60);
      setStatus("Completed! Approx. speed: " + wpm + " words per minute.");
    } else {
      setStatus("Keep typing...");
    }
  });
};

// 20. COIN FLIP
gameFunctions.coin = function () {
  let heads = 0, tails = 0;
  const result = makeText("Flip the coin!");
  result.style.fontSize = "35px";
  container.appendChild(result);

  container.appendChild(makeButton("FLIP COIN", () => {
    const isHeads = Math.random() < 0.5;
    if (isHeads) heads++;
    else tails++;
    result.textContent = isHeads ? "🪙 HEADS" : "🪙 TAILS";
    setStatus("Heads: " + heads + " | Tails: " + tails);
  }));
};

// 21. DICE ROLL
gameFunctions.dice = function () {
  const result = makeText("🎲");
  result.style.fontSize = "65px";
  container.appendChild(result);

  container.appendChild(makeButton("ROLL DICE", () => {
    const number = Math.floor(Math.random() * 6) + 1;
    result.textContent = ["⚀","⚁","⚂","⚃","⚄","⚅"][number - 1];
    setStatus("You rolled: " + number);
  }));
};

// 22. COLOR GUESS
gameFunctions.color = function () {
  const colors = [
    { name: "Red", value: "#e74c3c" },
    { name: "Blue", value: "#3498db" },
    { name: "Green", value: "#2ecc71" },
    { name: "Yellow", value: "#f1c40f" },
    { name: "Purple", value: "#9b59b6" }
  ];

  let score = 0;
  const box = document.createElement("div");
  box.style.cssText = "height:100px;border-radius:12px;margin:15px;background:#555;";
  container.appendChild(box);

  function next() {
    const answer = colors[Math.floor(Math.random() * colors.length)];
    box.style.background = answer.value;
    colors.forEach(c => {
      container.appendChild(makeButton(c.name, () => {
        if (c.name === answer.name) {
          score++;
          setStatus("Correct! Score: " + score);
        } else {
          setStatus("Wrong! The color was " + answer.name);
        }
        container.querySelectorAll("button").forEach(b => b.disabled = true);
        setTimeout(() => {
          container.querySelectorAll("button").forEach(b => b.disabled = false);
          next();
        }, 700);
      }));
    });
  }

  next();
};

// 23. TARGET SHOOTER
gameFunctions.target = function () {
  let score = 0;
  let time = 20;
  const target = makeButton("🎯", () => {
    score++;
    target.style.marginLeft = Math.floor(Math.random() * 180) + "px";
    setStatus("Score: " + score + " | Time: " + time);
  });
  target.style.fontSize = "35px";
  container.appendChild(target);

  gameTimer = setInterval(() => {
    time--;
    if (time <= 0) {
      clearInterval(gameTimer);
      gameTimer = null;
      target.disabled = true;
      setStatus("Time up! Final score: " + score);
    } else {
      setStatus("Score: " + score + " | Time: " + time);
    }
  }, 1000);
};

// 24. MAZE
gameFunctions.maze = function () {
  const layout = [
    "#########",
    "#S#.....#",
    "#.#.###.#",
    "#...#...#",
    "###.#.#.#",
    "#.....#E#",
    "#########"
  ];
  let row = 1, col = 1;
  const grid = makeGrid(9);

  function render() {
    grid.innerHTML = "";
    layout.forEach((line, r) => {
      [...line].forEach((cell, c) => {
        const b = document.createElement("div");
        b.textContent = r === row && c === col ? "🟢" :
          cell === "#" ? "⬛" : cell === "E" ? "🏁" : "▫️";
        b.style.cssText = "min-height:25px;display:grid;place-items:center;font-size:14px;";
        grid.appendChild(b);
      });
    });
  }

  function move(dr, dc) {
    const nr = row + dr, nc = col + dc;
    if (layout[nr] && layout[nr][nc] && layout[nr][nc] !== "#") {
      row = nr;
      col = nc;
      if (layout[row][col] === "E") setStatus("You escaped the maze!");
      render();
    }
  }

  [["↑",-1,0],["↓",1,0],["←",0,-1],["→",0,1]].forEach(([label, dr, dc]) => {
    container.appendChild(makeButton(label, () => move(dr, dc)));
  });
  render();
  setStatus("Find the finish flag!");
};

// 25. CARD PICK
gameFunctions.card = function () {
  const cards = ["🐱", "🐶", "🐼", "🦊", "🐸", "🐵"];
  let score = 0;
  const chosen = cards[Math.floor(Math.random() * cards.length)];
  const grid = makeGrid(3);

  cards.forEach(card => {
    gameButton(grid, "❔", () => {
      grid.children.forEach((b, i) => {
        b.textContent = cards[i];
        b.disabled = true;
      });
      if (card === chosen) {
        score++;
        setStatus("You found it! Score: " + score);
      } else {
        setStatus("Not this time. Hidden card was " + chosen);
      }
    });
  });
};

// 26. BASKETBALL
gameFunctions.basket = function () {
  let score = 0;
  const ball = makeButton("🏀", () => {
    const success = Math.random() > 0.4;
    if (success) score++;
    setStatus(success ? "Basket! Score: " + score : "Missed! Score: " + score);
  });
  ball.style.fontSize = "55px";
  container.appendChild(ball);
  setStatus("Tap the ball to shoot!");
};

// 27. FOOTBALL PENALTY
gameFunctions.football = function () {
  let goals = 0, shots = 0;
  const goal = makeButton("⚽ SHOOT", () => {
    shots++;
    const scored = Math.random() > 0.5;
    if (scored) goals++;
    setStatus((scored ? "GOAL!" : "Saved!") + " Goals: " + goals + "/" + shots);
  });
  goal.style.fontSize = "25px";
  container.appendChild(goal);
};

// 28. TOWER BUILDER
gameFunctions.tower = function () {
  let height = 0;
  const tower = makeText("");
  tower.style.fontSize = "35px";
  container.appendChild(tower);

  container.appendChild(makeButton("ADD BLOCK", () => {
    height++;
    tower.textContent = "🧱".repeat(Math.min(height, 12));
    setStatus("Tower height: " + height);
  }));
};

// 29. LIGHTS OUT
gameFunctions.lights = function () {
  let board = Array.from({ length: 25 }, () => Math.random() > 0.5);
  const grid = makeGrid(5);

  function render() {
    grid.innerHTML = "";
    board.forEach((on, i) => {
      gameButton(grid, on ? "💡" : "⚫", () => {
        const row = Math.floor(i / 5), col = i % 5;
        [ [0,0], [1,0], [-1,0], [0,1], [0,-1] ].forEach(([dr, dc]) => {
          const r = row + dr, c = col + dc;
          if (r >= 0 && r < 5 && c >= 0 && c < 5) {
            board[r * 5 + c] = !board[r * 5 + c];
          }
        });
        render();
        if (board.every(v => !v)) setStatus("You turned off all the lights!");
      });
    });
  }

  render();
  setStatus("Turn off every light!");
};

// 30. NUMBER GUESS
gameFunctions.minesweeper = function () {
  let number = Math.floor(Math.random() * 20) + 1;
  let attempts = 5;

  const input = makeInput("Guess a number from 1 to 20");
  input.type = "number";
  input.min = "1";
  input.max = "20";
  container.appendChild(input);

  container.appendChild(makeButton("GUESS", () => {
    const guess = Number(input.value);
    if (!guess || guess < 1 || guess > 20) {
      setStatus("Enter a number from 1 to 20.");
      return;
    }
    attempts--;
    if (guess === number) {
      setStatus("Correct! You won!");
    } else if (attempts <= 0) {
      setStatus("Game over! Number was " + number);
    } else {
      setStatus((guess < number ? "Try higher!" : "Try lower!") +
        " Attempts left: " + attempts);
    }
    input.value = "";
  }));
};

// 31. START GAME
const gameNames = {
  snake: "Snake",
  memory: "Memory Match",
  ttt: "Tic Tac Toe",
  rps: "Rock Paper Scissors",
  "2048": "2048",
  breakout: "Breakout",
  hangman: "Hangman",
  mole: "Whack a Mole",
  reaction: "Reaction Test",
  math: "Math Quiz",
  flappy: "Flappy",
  racing: "Car Racing",
  pong: "Pong",
  sudoku: "Mini Sudoku",
  word: "Word Guess",
  connect4: "Connect Four",
  simon: "Simon Says",
  jumper: "Jumper",
  typing: "Typing Speed",
  coin: "Coin Flip",
  dice: "Dice Roll",
  color: "Color Guess",
  target: "Target Shooter",
  maze: "Maze",
  card: "Card Pick",
  basket: "Basketball",
  football: "Football Penalty",
  tower: "Tower Builder",
  lights: "Lights Out",
  minesweeper: "Number Guess"
};

function startGame() {
  clearGame();

  const name = gameNames[gameId];
  if (titleElement) titleElement.textContent = name || "Game not found";

  if (!name || typeof gameFunctions[gameId] !== "function") {
    container.textContent = "Sorry, this game could not be found. Go back to the homepage.";
    setStatus("");
    return;
  }

  gameFunctions[gameId]();
}

restartButton.addEventListener("click", startGame);
startGame();

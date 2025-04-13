const canvas = document.getElementById("gameCanvas"); 
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 360;

const pipeImg = new Image();
pipeImg.src = "https://i.ibb.co/MkQGY8XB/pipe-removebg-preview.png";

const birdImg = new Image();
birdImg.src = "https://i.postimg.cc/5trgPjs6/png-clipart-flappy-bird-tap-bird-2d-jump-bird-jump-squishy-bird-flies-game-animals-removebg-preview.png";

const bgImg = new Image();
bgImg.src = "https://i.postimg.cc/fWcyCpLN/desktop-wallpaper-flappy-bird-backgrounds-flappy-bird.jpg";

// Vibing Music
const vibingMusic = new Audio('https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3');
vibingMusic.loop = true;
vibingMusic.volume = 0.5; // Adjust volume as needed

const scoreDisplay = document.getElementById("score");
const modal = document.getElementById("gameOverModal");
const restartButton = document.getElementById("restartButton");
const startHint = document.getElementById("startHint");
const getReady = document.getElementById("getReady");
const countdown = document.getElementById("countdown");

let bird, pipes, frame, score;
let gameOver = false;
let gameStarted = false;
let getReadyPhase = false;
let animationId = null;

function initGame() {
  cancelAnimationFrame(animationId);

  bird = {
    x: canvas.width * 0.2,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    gravity: 0.4,
    velocity: 0,
    lift: -7
  };

  pipes = [];
  frame = 0;
  score = 0;
  gameOver = false;
  gameStarted = false;
  getReadyPhase = false;

  scoreDisplay.textContent = "Score: 0";
  modal.style.display = "none";
  startHint.style.display = "block";
  getReady.style.display = "none";
  countdown.style.display = "none";

  animationId = requestAnimationFrame(update);
}

function drawBird() {
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawPipe(pipe) {
  ctx.drawImage(pipeImg, pipe.x, 0, pipe.width, pipe.top);
  ctx.drawImage(pipeImg, pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
}

function updatePipes() {
  if (frame % 100 === 0) {
    const gap = 140;
    const top = Math.floor(Math.random() * (canvas.height - gap - 100)) + 20;
    pipes.push({
      x: canvas.width,
      width: 170,
      top,
      bottom: canvas.height - top - gap,
      passed: false
    });
  }

  pipes.forEach((pipe, index) => {
    pipe.x -= 2;

    // Check for collisions with pipes
    if (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      endGame();
    }

    // Increment score when bird passes a pipe
    if (!pipe.passed && pipe.x + pipe.width < bird.x) {
      score++;
      scoreDisplay.textContent = "Score: " + score;
      pipe.passed = true;
    }

    if (pipe.x + pipe.width < 0) {
      pipes.splice(index, 1); // Remove pipes that go off-screen
    }
  });
}

function endGame() {
  gameOver = true;
  vibingMusic.pause();
  vibingMusic.currentTime = 0;
  modal.style.display = "flex"; // Show game over modal
}

function startCountdown() {
  let count = 3;
  countdown.textContent = count;
  countdown.style.display = "block";
  getReady.style.display = "none";

  const countdownInterval = setInterval(() => {
    count--;
    countdown.textContent = count;
    if (count <= 0) {
      clearInterval(countdownInterval);
      countdown.style.display = "none";
      gameStarted = true;

      // Try to play music on start if not already playing
      vibingMusic.play().catch(err => {
        console.log("Music play failed again: ", err);
      });
    }
  }, 1000);
}

function update() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  pipes.forEach(drawPipe);
  drawBird();

  if (!gameStarted) {
    if (getReadyPhase) {
      bird.y = canvas.height / 2 + Math.sin(frame / 10) * 6;
    }
    frame++;
    animationId = requestAnimationFrame(update);
    return;
  }

  if (!gameOver) {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Game over if bird hits ground or top
    if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
      endGame();
    }

    updatePipes();
    frame++;
  }

  animationId = requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameStarted && !getReadyPhase) {
      startGetReady(); // Start the "Get Ready" phase
    }
    if (gameStarted && !gameOver) {
      bird.velocity = bird.lift;
    }
  }
});

canvas.addEventListener("click", () => {
  if (!gameStarted && !getReadyPhase) {
    startGetReady(); // Start the "Get Ready" phase
  }
  if (gameStarted && !gameOver) {
    bird.velocity = bird.lift;
  }
});

restartButton.addEventListener("click", () => {
  initGame();
});

// Start music on first interaction (keyboard or mouse)
function startMusicOnce() {
  if (vibingMusic.paused) {
    vibingMusic.play().catch(e => {
      console.log("Music autoplay blocked. Playing after interaction.");
    });
  }
  document.removeEventListener("click", startMusicOnce);
  document.removeEventListener("keydown", startMusicOnce);
}

document.addEventListener("click", startMusicOnce);
document.addEventListener("keydown", startMusicOnce);

// New function for starting the "Get Ready" phase
function startGetReady() {
  getReady.style.display = "block"; // Display the "Get Ready" message
  startHint.style.display = "none"; // Hide the start hint
  getReadyPhase = true;

  setTimeout(() => {
    startCountdown(); // Start the countdown after "Get Ready" message
  }, 1000);
}

initGame();

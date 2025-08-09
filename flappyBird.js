"use strict";

// Game variables
const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const tryAgainBtn = document.getElementById("try-again-btn");
const gameOverDiv = document.getElementById("game-over");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const finalScoreDisplay = document.getElementById("final-score");

// Game state
let gameRunning = false;
let animationFrameId = null;
let highScore = localStorage.getItem('flappyBirdHighScore') || 0;
highScoreDisplay.textContent = highScore;

// Create visible elements without external images
function drawBird(x, y) {
    ctx.fillStyle = "#FFD700"; // Gold color for bird
    ctx.beginPath();
    ctx.arc(x + 15, y + 15, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FF6347"; // Orange beak
    ctx.fillRect(x + 25, y + 12, 10, 5);
    ctx.fillStyle = "#000"; // Black eye
    ctx.beginPath();
    ctx.arc(x + 20, y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawPipe(x, y, width, height, isTop) {
    ctx.fillStyle = "#228B22"; // Forest green pipes
    ctx.fillRect(x, y, width, height);
    // Add pipe rim
    ctx.fillStyle = "#006400";
    ctx.fillRect(x - 3, isTop ? y + height - 10 : y, width + 6, 10);
}

function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, cvs.height);
    skyGradient.addColorStop(0, "#87CEEB"); // Light sky blue
    skyGradient.addColorStop(1, "#1E90FF"); // Dodger blue
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, cvs.width, cvs.height);
}

function drawGround() {
    ctx.fillStyle = "#8B4513"; // Saddle brown ground
    ctx.fillRect(0, cvs.height - 50, cvs.width, 50);
}

// Game settings
const gap = 100;
let constant;
let bX = 50;
let bY = 150;
const gravity = 1.5;
let score = 0;
const birdSize = 30;
const pipeWidth = 60;

// Pipe coordinates
let pipes = [{
    x: cvs.width,
    y: Math.floor(Math.random() * 200) - 200
}];

// Event listeners
document.addEventListener("keydown", (e) => {
    if ((e.code === "Space" || e.key === "ArrowUp") && gameRunning) {
        moveUp();
    }
});

cvs.addEventListener("click", () => {
    if (gameRunning) moveUp();
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
tryAgainBtn.addEventListener("click", restartGame);

// Touch support for mobile
document.addEventListener('touchstart', (e) => {
    if (gameRunning) {
        moveUp();
        e.preventDefault();
    }
}, { passive: false });

function moveUp() {
    bY -= 30;
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        startBtn.disabled = true;
        resetGame();
        draw();
    }
}

function restartGame() {
    gameOverDiv.classList.add("hidden");
    resetGame();
    if (!gameRunning) {
        gameRunning = true;
        draw();
    }
}

function resetGame() {
    bX = 50;
    bY = 150;
    score = 0;
    scoreDisplay.textContent = score;
    pipes = [{
        x: cvs.width,
        y: Math.floor(Math.random() * 200) - 200
    }];
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

function endGame() {
    gameRunning = false;
    
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('flappyBirdHighScore', highScore);
    }
    
    finalScoreDisplay.textContent = score;
    gameOverDiv.classList.remove("hidden");
    startBtn.disabled = false;
}

function draw() {
    if (!gameRunning) return;
    
    animationFrameId = requestAnimationFrame(draw);
    
    // Clear canvas
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    
    // Draw background
    drawBackground();
    
    // Draw pipes
    for (let i = 0; i < pipes.length; i++) {
        constant = 200 + gap; // Pipe height + gap
        
        // Top pipe
        drawPipe(pipes[i].x, pipes[i].y, pipeWidth, 200, true);
        
        // Bottom pipe
        drawPipe(pipes[i].x, pipes[i].y + constant, pipeWidth, cvs.height, false);
        
        pipes[i].x -= 2;
        
        // Add new pipe when first pipe reaches certain position
        if (pipes[i].x === cvs.width / 2) {
            pipes.push({
                x: cvs.width,
                y: Math.floor(Math.random() * 200) - 200
            });
            
            // Limit number of pipes
            if (pipes.length > 3) {
                pipes.shift();
            }
        }
        
        // Collision detection
        const birdRight = bX + birdSize;
        const pipeRight = pipes[i].x + pipeWidth;
        const birdBottom = bY + birdSize;
        const pipeTopBottom = pipes[i].y + 200;
        const pipeBottomTop = pipes[i].y + constant;
        
        if (
            (birdRight >= pipes[i].x && bX <= pipeRight) &&
            (bY <= pipeTopBottom || birdBottom >= pipeBottomTop) ||
            birdBottom >= cvs.height - 50
        ) {
            endGame();
            return;
        }
        
        // Score increment
        if (pipes[i].x + pipeWidth === bX && bX > 0) {
            score++;
            scoreDisplay.textContent = score;
        }
    }
    
    // Draw ground
    drawGround();
    
    // Draw bird
    drawBird(bX, bY);
    
    // Apply gravity
    bY += gravity;
    
    // Draw score
    ctx.fillStyle = "#000";
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.fillText(`Score: ${score}`, 20, 30);
}

// Initialize high score display
highScoreDisplay.textContent = highScore;

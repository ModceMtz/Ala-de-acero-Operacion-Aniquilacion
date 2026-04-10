// ===============================
// CANVAS
// ===============================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

// ===============================
// MENU Y SKINS
// ===============================
let gameStarted = false;
let selectedSkin = "assets/img/kin1.png";

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const skinOptions = document.querySelectorAll(".skin-option");

const playerImage = new Image();
playerImage.src = selectedSkin;

skinOptions.forEach(option => {
    option.addEventListener("click", () => {
        skinOptions.forEach(o => o.classList.remove("skin-selected"));
        option.classList.add("skin-selected");

        selectedSkin = option.src;
        playerImage.src = selectedSkin;
    });
});

startBtn.addEventListener("click", () => {
    menu.style.display = "none";
    startGame();
});

// ===============================
// IMÁGENES
// ===============================
const enemy1Img = new Image();
enemy1Img.src = "assets/img/enemigo1.png";

const enemy2Img = new Image();
enemy2Img.src = "assets/img/enemigo2.png";

const enemy3Img = new Image();
enemy3Img.src = "assets/img/enemigo3.png";

// ===============================
// FONDOS (ESCENARIOS)
// ===============================
const backgrounds = [
    "assets/img/Paisaje1.png",
    "assets/img/Paisaje2.png",
    "assets/img/Paisaje3.png",
    "assets/img/Paisaje4.png",
    "assets/img/Paisaje5.png",
    "assets/img/Paisaje6.png"
];

const backgroundImage = new Image();
let currentBackground = "";

function changeBackground() {
    let randomIndex = Math.floor(Math.random() * backgrounds.length);
    currentBackground = backgrounds[randomIndex];
    backgroundImage.src = currentBackground;
}

// ===============================
// UI
// ===============================
const scoreText = document.getElementById("score");
const lifeBar = document.getElementById("lifeBar");
const lifeText = document.getElementById("lifeText");

// ===============================
let score = 0;

let enemies = [];
let bullets = [];
let enemyBullets = [];
let missiles = [];

// ===============================
// JUGADOR
// ===============================
let player = {
    x: 400,
    y: 400,
    size: 50,
    life: 100
};

// ===============================
// CONTROLES
// ===============================
canvas.addEventListener("mousemove", (e) => {
    if (gameStarted) {
        player.x = e.offsetX - player.size / 2;
        player.y = e.offsetY - player.size / 2;
    }
});

canvas.addEventListener("click", () => {
    if (gameStarted) {
        bullets.push({
            x: player.x + player.size / 2 - 2,
            y: player.y,
            width: 5,
            height: 10,
            dy: -7
        });
    }
});

// ===============================
// VIDA
// ===============================
function updateLifeBar() {
    if (player.life < 0) player.life = 0;

    lifeBar.style.width = player.life + "%";
    lifeText.innerText = player.life + "%";

    if (player.life > 60) lifeBar.style.background = "lime";
    else if (player.life > 30) lifeBar.style.background = "yellow";
    else lifeBar.style.background = "red";
}

// ===============================
// GAME OVER
// ===============================
function gameOver() {
    gameStarted = false;

    enemies = [];
    bullets = [];
    enemyBullets = [];
    missiles = [];

    player.life = 100;
    player.x = 400;
    player.y = 400;

    score = 0;
    scoreText.innerText = "Score: 0";

    menu.style.display = "flex";

    updateLifeBar();
}

// ===============================
// NIVELES
// ===============================
let level = 1;
let maxLevels = 10;

let enemiesToSpawn;
let enemiesSpawned = 0;
let enemiesTotal = 0;

let levelMessageTimer = 0;

// ===============================
function startGame() {
    gameStarted = true;
    level = 1;
    score = 0;
    player.life = 100;
    updateLifeBar();

    changeBackground(); // 🔥 fondo inicial

    resetLevel();
}

// ===============================
function resetLevel() {
    enemies = [];
    bullets = [];
    enemyBullets = [];
    missiles = [];

    changeBackground(); // 🔥 cambia fondo por nivel

    enemiesToSpawn = {
        kamikaze: 10 + (level - 1) * 5,
        caza: 20 + (level - 1) * 5,
        heli: 40 + (level - 1) * 5
    };

    enemiesSpawned = 0;
    enemiesTotal =
        enemiesToSpawn.kamikaze +
        enemiesToSpawn.caza +
        enemiesToSpawn.heli;

    levelMessageTimer = 120;
}

// ===============================
function nextLevel() {
    level++;

    if (level > maxLevels) {
        alert("GANASTE 🎉");
        gameOver();
        return;
    }

    resetLevel();
}

// ===============================
// SPAWN
// ===============================
function spawnEnemy() {
    if (!gameStarted) return;
    if (enemiesSpawned >= enemiesTotal) return;

    let size = 50;

    let available = [];
    if (enemiesToSpawn.kamikaze > 0) available.push(0);
    if (enemiesToSpawn.caza > 0) available.push(1);
    if (enemiesToSpawn.heli > 0) available.push(2);

    let type = available[Math.floor(Math.random() * available.length)];

    if (type === 0) enemiesToSpawn.kamikaze--;
    if (type === 1) enemiesToSpawn.caza--;
    if (type === 2) enemiesToSpawn.heli--;

    let posX, posY, dir = 0;

    if (type === 2) {
        posY = Math.random() * (canvas.height / 2);

        if (Math.random() < 0.5) {
            posX = -size;
            dir = 1;
        } else {
            posX = canvas.width + size;
            dir = -1;
        }
    } else {
        posX = Math.random() * (canvas.width - size);
        posY = -size;
    }

    enemies.push({
        x: posX,
        y: posY,
        size: size,
        type: type,
        dir: dir,
        shootTimer: 0,
        missilesShot: 0
    });

    enemiesSpawned++;
}

setInterval(spawnEnemy, 800);

// ===============================
// DIBUJOS
// ===============================
function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.size, player.size);
}

function drawEnemies() {
    enemies.forEach((enemy, i) => {

        let mitad = canvas.height / 2;

        if (enemy.type === 0) {
            if (player.y > mitad) {
                let dx = player.x - enemy.x;
                enemy.x += dx * 0.03;
                enemy.y += 2.5;
            } else {
                enemy.y += 3.5;
            }
            ctx.drawImage(enemy1Img, enemy.x, enemy.y, enemy.size, enemy.size);
        }

        if (enemy.type === 1) {
            enemy.y += 1;
            enemy.shootTimer++;

            if (enemy.shootTimer > 80 && enemy.missilesShot < 4) {
                missiles.push({ x: enemy.x, y: enemy.y, life: 120 });
                enemy.missilesShot++;
                enemy.shootTimer = 0;
            }

            ctx.drawImage(enemy2Img, enemy.x, enemy.y, enemy.size, enemy.size);
        }

        if (enemy.type === 2) {
            enemy.x += enemy.dir * 2;
            enemy.shootTimer++;

            if (enemy.shootTimer % 120 < 25) {
                if (enemy.shootTimer % 4 === 0) {
                    enemyBullets.push({
                        x: enemy.x + enemy.size / 2,
                        y: enemy.y + enemy.size
                    });
                }
            }

            ctx.drawImage(enemy3Img, enemy.x, enemy.y, enemy.size, enemy.size);

            if (
                enemy.x < -enemy.size * 2 ||
                enemy.x > canvas.width + enemy.size * 2
            ) {
                enemies.splice(i, 1);
            }
        }

        if (enemy.type !== 2 && enemy.y > canvas.height) {
            enemies.splice(i, 1);
        }
    });
}

// ===============================
// BALAS
// ===============================
function drawBullets() {
    bullets.forEach((b, i) => {
        b.y += b.dy;
        ctx.fillStyle = "yellow";
        ctx.fillRect(b.x, b.y, b.width, b.height);

        if (b.y < 0) bullets.splice(i, 1);
    });
}

// ===============================
// MISILES
// ===============================
function drawMissiles() {
    missiles.forEach((m, i) => {

        let dx = player.x - m.x;
        let dy = player.y - m.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            dx /= dist;
            dy /= dist;
        }

        m.x += dx * 2;
        m.y += dy * 2;

        m.life--;

        ctx.fillStyle = "orange";
        ctx.fillRect(m.x, m.y, 6, 12);

        if (m.life <= 0) missiles.splice(i, 1);
    });
}

// ===============================
// BALAS ENEMIGOS
// ===============================
function drawEnemyBullets() {
    enemyBullets.forEach((b, i) => {
        b.y += 3;
        ctx.fillStyle = "white";
        ctx.fillRect(b.x, b.y, 4, 8);

        if (b.y > canvas.height) enemyBullets.splice(i, 1);
    });
}

// ===============================
// COLISIONES
// ===============================
function detectCollisions() {

    enemies.forEach((enemy, ei) => {

        bullets.forEach((b, bi) => {
            if (
                b.x < enemy.x + enemy.size &&
                b.x + b.width > enemy.x &&
                b.y < enemy.y + enemy.size &&
                b.y + b.height > enemy.y
            ) {
                if (enemy.type === 0) score += 20;
                if (enemy.type === 1) score += 15;
                if (enemy.type === 2) score += 10;

                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
            }
        });

        if (
            player.x < enemy.x + enemy.size &&
            player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.size > enemy.y
        ) {
            player.life -= 25;
            enemies.splice(ei, 1);
        }
    });

    missiles.forEach((m, i) => {
        if (
            m.x < player.x + player.size &&
            m.x > player.x &&
            m.y < player.y + player.size &&
            m.y > player.y
        ) {
            player.life -= 15;
            missiles.splice(i, 1);
        }
    });

    enemyBullets.forEach((b, i) => {
        if (
            b.x < player.x + player.size &&
            b.x > player.x &&
            b.y < player.y + player.size &&
            b.y > player.y
        ) {
            player.life -= 5;
            enemyBullets.splice(i, 1);
        }
    });

    updateLifeBar();
    scoreText.innerText = "Score: " + score;

    if (player.life <= 0) {
        alert("GAME OVER");
        gameOver();
    }
}

// ===============================
// TEXTO NIVEL
// ===============================
function drawLevelText() {
    if (levelMessageTimer > 0) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Nivel " + level, canvas.width / 2, canvas.height / 2);
        levelMessageTimer--;
    }
}

// ===============================
// LOOP
// ===============================
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🔥 FONDO
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🔥 FONDO
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // 🔥 CAPA OSCURA (OPACIDAD)
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // ← ajusta aquí
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted) {
        drawPlayer();
        drawEnemies();
        drawBullets();
        drawMissiles();
        drawEnemyBullets();
        detectCollisions();
        drawLevelText();

        if (enemiesSpawned >= enemiesTotal && enemies.length === 0) {
            nextLevel();
        }
    }

    requestAnimationFrame(update);
}

update();
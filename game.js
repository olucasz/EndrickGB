const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const failSound = document.getElementById("failSound")
const jumpSound = document.getElementById("jumpSound")
const music = document.getElementById("music")

// Game variables
let dino = {
    image: new Image(),
    x: 100,
    y: 150,
    width: 120,
    height: 120,
    dy: 0,
    jumpStrength: 16,
    gravity: 0.7,
    grounded: false,
    collisionMargin: { top: 60, right: 60, bottom: 60, left: 60 } // Collision margins
};

let obstacle1 = {
    image: new Image(),
    x: canvas.width,
    width: 40,
    height: 70,
};

obstacle1.image.src = "images/Curintia.png";
dino.image.src = "images/endrick.png";

let obstacles = [obstacle1];
let gameSpeed = 5;
let score = 0;
let runAnimation = true;
let colisao = false;
let frameCount = 0;
let gameStarted = false;
let isJumping = false; // Variável para controle de pulo

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        isJumping = true;  
        jumpSound.play(); 
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        isJumping = false;
    }
});

// Array de imagens de fundo para parallax
const backgrounds = [
    { src: 'parallax/stadio.png', speed: 0 },
    { src: 'parallax/nuvem.png', speed: 0.6 },
    { src: 'parallax/torcida.png', speed: 0 },
    { src: 'parallax/6ground.png', speed: 0 }
];

// Array para armazenar objetos Image para as imagens de fundo
const backgroundImages = backgrounds.map(bg => {
    const img = new Image();
    img.src = bg.src;
    return { img, speed: bg.speed, x: 0 };
});

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Imagem de tela de início
const startScreenImage = new Image();
startScreenImage.src = 'images/INICIO.png';

// Função para carregar todas as imagens necessárias
function loadImages() {
    return new Promise((resolve, reject) => {
        let imagesLoaded = 0;
        const totalImages = backgrounds.length + obstacles.length + 2; // backgrounds + obstacles + dino + startScreenImage

        // Callback para verificar se todas as imagens foram carregadas
        function checkAllImagesLoaded() {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                resolve();
            }
        }

        // Carrega imagem de tela de início
        startScreenImage.onload = checkAllImagesLoaded;
        // Carrega imagens de fundo para parallax
        backgroundImages.forEach(bg => {
            bg.img.onload = checkAllImagesLoaded;
        });

        // Carrega imagens do dinossauro e obstáculos
        dino.image.onload = checkAllImagesLoaded;
        obstacle1.image.onload = checkAllImagesLoaded;
    });
}

// Função para desenhar a tela de início
function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha a imagem de fundo da tela de início
    ctx.drawImage(startScreenImage, 0, 0, canvas.width, canvas.height);

    // Texto para instrução de início
    const fontSize = 30;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Pressione Espaço para Iniciar", canvas.width / 2, canvas.height - 50);

    // Evento de tecla pressionada para iniciar o jogo
    document.addEventListener('keydown', startGame);
}

// Função para desenhar o dinossauro
function drawDino() {
    ctx.drawImage(dino.image, dino.x, dino.y, dino.width, dino.height);
}

// Função para animar o dinossauro
function run() {
    if (frameCount === 10) {
        dino.image.src = runAnimation ? "images/endrickP.png" : "images/endrickJ.png";
        runAnimation = !runAnimation;
        frameCount = 0;
    }
}

// Função para desenhar os obstáculos
function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Função para atualizar a posição dos obstáculos
function updateObstacles() {
    let randomObstacle = randomIntFromRange(1, 4);
    if (obstacles[obstacles.length - 1].x < canvas.width - randomIntFromRange(10, 100)) {
        let obstacle = {
            image: new Image(),
            x: canvas.width + randomIntFromRange(300, 400),
            y: 290,
            width: 100,
            height: 100,
        };
        if (randomObstacle === 1) {
            obstacle.image.src = "images/Curintia.png";
        } else if (randomObstacle === 2) {
            obstacle.image.src = "images/mengo.png";
            obstacle.width = 138;
            obstacle.height = 130;
            obstacle.y = 274;
        } else if (randomObstacle === 3) {
            obstacle.image.src = "images/santos.png";
            obstacle.width = 100;
        } else if (randomObstacle === 4) {
            obstacle.image.src = "images/saoP.png";
            obstacle.width = 100;
        }
        obstacles.push(obstacle);
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

// Função para detectar colisões
function detectCollision() {
    obstacles.forEach(obstacle => {
        let dinoCollisionBox = {
            x: dino.x + dino.collisionMargin.left,
            y: dino.y + dino.collisionMargin.top,
            width: dino.width - dino.collisionMargin.left - dino.collisionMargin.right,
            height: dino.height - dino.collisionMargin.top - dino.collisionMargin.bottom
        };

        if (
            dinoCollisionBox.x < obstacle.x + obstacle.width &&
            dinoCollisionBox.x + dinoCollisionBox.width > obstacle.x &&
            dinoCollisionBox.y < obstacle.y + obstacle.height &&
            dinoCollisionBox.y + dinoCollisionBox.height > obstacle.y
        ) {
            // Colisão detectada
            colisao = true;
            fail();
        }
    });
}

// Função para tratar o fim do jogo
function fail() {
    failSound.play();
    const fontSize = 70;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "white";
    const x = canvas.width / 4.5;
    const y = canvas.height / 2;
    ctx.fillText("GAME OVER", x, y);

    // Mostra opção de reiniciar o jogo
    reset();
}

// Função para reiniciar o jogo após o fim
function reset() {
    if (colisao) {
        document.addEventListener('keydown', restartGame);
        const fontSize = 30;
        ctx.font = `${fontSize}px Verdana`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Pressione Espaço para Reiniciar", canvas.width / 2, canvas.height - 50);
    }
}

// Função para atualizar a posição do dinossauro
function updateDino() {
    if (dino.grounded && dino.dy === 0 && isJumping) {
        dino.dy = -dino.jumpStrength;
        dino.grounded = false;
    }

    if (isJumping && dino.dy < 0) {
        dino.dy += dino.gravity;
    } else if (dino.y + dino.height < canvas.height - 10) {
        dino.dy += dino.gravity;
    } else {
        dino.dy = 0;
        dino.grounded = true;
        dino.y = canvas.height - 10 - dino.height;
    }

    dino.y += dino.dy;

    if (isJumping === true) {
        dino.image.src = "images/endrick.png";
    }
}



// Função para reiniciar o jogo quando o jogador pressiona a tecla Espaço
function restartGame(e) {
    if (e.code === 'Space') {
        document.location.reload();
    }
}

// Função para iniciar o jogo quando o jogador pressiona a tecla Espaço
function startGame(e) {
    if (!gameStarted && e.code === 'Space') {
        gameStarted = true;
        document.removeEventListener('keydown', startGame); // Remover o event listener após iniciar o jogo
        gameLoop(); // Inicia o loop do jogo após o início do jogo ser confirmado
    }
}

// Função para desenhar tudo no canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha as imagens de fundo com parallax
    backgroundImages.forEach(bg => {
        bg.x -= bg.speed;
        if (bg.x <= -canvas.width) {
            bg.x = 0;
        }
        ctx.drawImage(bg.img, bg.x, 0, canvas.width, canvas.height);
        ctx.drawImage(bg.img, bg.x + canvas.width, 0, canvas.width, canvas.height);
    });

    // Desenha os obstáculos e o dinossauro
    drawObstacles();
    drawDino();
}

// Função para atualizar o jogo
function update() {
    updateDino();
    updateObstacles();
    detectCollision();
    run();
}

// Função para o loop principal do jogo
function gameLoop() {
    draw(); // Desenha o jogo
    update(); // Atualiza a lógica do jogo

    if (!colisao) {
        requestAnimationFrame(gameLoop); // Continua o loop do jogo se não houve colisão
    }
    frameCount++;
}

// Inicia o carregamento de imagens e exibe a tela de início
loadImages().then(() => {
    drawStartScreen(); // Mostra a tela de início após carregar as imagens
});

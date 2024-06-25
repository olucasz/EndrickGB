const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variáveis de jogo
let dinoX = 50;
let dinoY = canvas.height - 50;
let dinoWidth = 50;
let dinoHeight = 50;
let jumpForce = 18;
let gravity = 1;
let isJumping = false;
let score = 0;
let gameSpeed = 10 + score * 0.1;

// Objetos
let obstacles = [];

// Função para criar obstáculos
class Obstacle {
    constructor(x, width) {
        this.x = x;
        this.y = canvas.height - 50;
        this.width = width;
        this.height = 50;
        this.color = '#880015'; // Cor do obstáculo

        this.dx = -gameSpeed; // Velocidade do obstáculo

        // Método para desenhar o obstáculo
        this.draw = function() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // Método para atualizar a posição do obstáculo
        this.update = function() {
            this.x += this.dx;
            this.draw();
        }
    }
}

function createObstacle() {
    let minWidth = 20;
    let maxWidth = 60;
    let width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
    let obstacle = new Obstacle(canvas.width, width);
    obstacles.push(obstacle);
}

// Função para desenhar o dinossauro
function drawDino() {
    ctx.fillStyle = '#333';
    ctx.fillRect(dinoX, dinoY, dinoWidth, dinoHeight);
}

// Função para verificar colisões
function checkCollision(obstacle) {
    if (dinoX < obstacle.x + obstacle.width &&
        dinoX + dinoWidth > obstacle.x &&
        dinoY < obstacle.y + obstacle.height &&
        dinoY + dinoHeight > obstacle.y) {
        return true;
    }
    return false;
}

// Função principal de animação
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar dinossauro
    drawDino();

    // Gravidade e pulo do dinossauro
    if (isJumping) {
        dinoY -= jumpForce;
        jumpForce -= 1;
    } else if (dinoY < canvas.height - dinoHeight) {
        dinoY += gravity;
    }

    // Verificar se o dinossauro está no chão
    if (dinoY > canvas.height - dinoHeight) {
        dinoY = canvas.height - dinoHeight;
        jumpForce = 18;
        isJumping = false;
    }

    // Gerar obstáculos aleatoriamente
    if (Math.random() < 0.02) {
        createObstacle();
    }

    // Atualizar e desenhar obstáculos
    obstacles.forEach((obstacle, index) => {
        if (checkCollision(obstacle)) {
            alert(`Game Over! Pontuação: ${score}`);
            obstacles = [];
            score = 0;
            gameSpeed = 10;
        }

        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
            if (score % 10 === 0) {
                gameSpeed++;
            }
        }

        obstacle.update();
    });

    // Atualizar pontuação
    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    requestAnimationFrame(animate);
}

// Controle do pulo do dinossauro
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isJumping) {
        isJumping = true;
    }
});

// Iniciar o jogo
animate();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const objects = [];
const numObjects = 20;
let score = 0; // Score or number of objects caught
let gameEnded = false; // Flag to track game end

for (let i = 0; i < numObjects; i++) {
    objects.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        size: 30,
        speed: 2 + Math.random() * 3,
        rotation: Math.random() * Math.PI // rotation star
    });
}

let basket = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 50,
    width: 100,
    height: 50,
    speed: 0, // speed  basket
    acceleration: 0.2, // gas 
    maxSpeed: 10, // Maximum speed
    friction: 0.1 //  slow down  basket
};

let progressBarWidth = 0; // width of the progress bar
let smiley = {
    x: canvas.width / 2,
    y: 50,
    radius: 40, // Radius  smiley face
    mood: 'happy', //  mood smiley
    color: '#FFD700', // Yellow color  happy smiley
    expressionSpeed: 2 // Speed  smiley changes expression
};

function drawStar(x, y, size, rotation) {
    ctx.save();

    // Translate the coordinate system to the center of the star
    ctx.translate(x, y);

    // Rotate  star
    ctx.rotate(rotation);

    // Draw a star shape
    ctx.beginPath();
    ctx.moveTo(size, 0);
    for (let i = 0; i < 5; i++) {
        ctx.rotate(Math.PI / 5);
        ctx.lineTo(size, 0);
        ctx.rotate(Math.PI / 5);
        ctx.lineTo(size / 2, 0);
    }
    ctx.closePath();

    // Fill color
    ctx.fillStyle = '#FFD700'; // Yellow color for stars
    ctx.fill();

    ctx.restore();
}

function drawBasket() {
    ctx.beginPath();
    ctx.rect(basket.x, basket.y, basket.width, basket.height);
    ctx.fillStyle = '#008000';
    ctx.fill();
    ctx.closePath();

    // Draw scoreboard near the basket
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(`Score: ${score}`, basket.x + 10, basket.y - 20);
}

function drawProgressBar() {
    ctx.beginPath();
    ctx.rect(10, 10, progressBarWidth, 20);
    ctx.fillStyle = '#00FF00';
    ctx.fill();
    ctx.closePath();
}

function drawSmiley() {
    // Draw face
    ctx.beginPath();
    ctx.arc(smiley.x, smiley.y, smiley.radius, 0, Math.PI * 2);
    ctx.fillStyle = smiley.color;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw eyes
    const eyeOffsetX = smiley.radius / 3;
    const eyeOffsetY = -smiley.radius / 5;
    const eyeRadius = smiley.radius / 8;

    ctx.beginPath();
    ctx.arc(smiley.x - eyeOffsetX, smiley.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(smiley.x + eyeOffsetX, smiley.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.closePath();

    // Draw mouth based on mood
    const mouthOffsetY = smiley.radius / 5;
    const mouthRadius = smiley.radius / 4;

    ctx.beginPath();
    if (smiley.mood === 'happy') {
        ctx.arc(smiley.x, smiley.y + mouthOffsetY, mouthRadius, 0, Math.PI);
    } else {
        ctx.moveTo(smiley.x - mouthRadius, smiley.y + mouthOffsetY);
        ctx.lineTo(smiley.x + mouthRadius, smiley.y + mouthOffsetY);
    }
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function updateObject(object) {
    object.y += object.speed;
    if (object.y - object.size > canvas.height) {
        object.y = -object.size;
        object.x = Math.random() * canvas.width;
    }
}

function moveBasket(e) {
    const rect = canvas.getBoundingClientRect();
    basket.x = e.clientX - rect.left - basket.width / 2; // Center the basket on mouse pointer

    // Ensure the basket stays within the bounds of the canvas
    if (basket.x < 0) {
        basket.x = 0;
    } else if (basket.x + basket.width > canvas.width) {
        basket.x = canvas.width - basket.width;
    }
}

function applyFriction() {
    // Apply friction to slow down the basket gradually
    if (basket.speed > 0) {
        basket.speed -= basket.friction;
        if (basket.speed < 0) {
            basket.speed = 0;
        }
    } else if (basket.speed < 0) {
        basket.speed += basket.friction;
        if (basket.speed > 0) {
            basket.speed = 0;
        }
    }
}

function updateSmiley() {
    // Change smiley mood based on score
    if (score > 20) {
        smiley.mood = 'happy';
        smiley.color = '#FFD700'; // Yellow for happy
    } else {
        smiley.mood = 'sad';
        smiley.color = '#696969'; // Gray for sad
    }

    // Speed up the transition of smiley expression based on score
    if (progressBarWidth > 0) {
        const maxSpeed = 4; // Maximum speed for expression
        const speedFactor = Math.min(score / numObjects * maxSpeed, maxSpeed);
        smiley.expressionSpeed = speedFactor;
    }

    // End game logic
    if (progressBarWidth >= canvas.width - 20 && !gameEnded) {
        setTimeout(() => {
            smiley.mood = 'happy'; // Make the smiley happy for a while
            setTimeout(() => {
                gameEnded = true;
                ctx.font = '40px Arial';
                ctx.fillStyle = '#FF0000';
                ctx.textAlign = 'center';
                ctx.fillText('End game', canvas.width / 2, canvas.height / 2);
            }, 2000); // Display "End game" after 2 seconds
        }, 500); // Keep smiley happy for 0.5 seconds after filling the progress bar
    }
}

function checkCollision(object) {
    // Check collision with basket
    if (object.y + object.size > basket.y && object.x > basket.x && object.x < basket.x + basket.width) {
        object.y = -object.size;
        object.x = Math.random() * canvas.width;
        score++;
        progressBarWidth = (score / numObjects) * (canvas.width - 20);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw objects
    objects.forEach(object => {
        updateObject(object);
        drawStar(object.x, object.y, object.size, object.rotation); // Draw star instead of circle
        checkCollision(object);
    });

    // Update smiley 
    updateSmiley();

    // Draw basket, progress bar, and smiley
    drawBasket();
    drawProgressBar();
    drawSmiley();

    requestAnimationFrame(animate);
}

// Listen for mouse movement to move the basket
canvas.addEventListener('mousemove', moveBasket);

// Start the animation
animate();

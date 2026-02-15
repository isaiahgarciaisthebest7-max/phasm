// --- CONFIGURATION ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 600;

let player = { x: 2, y: 2, dir: 0, sanity: 100, item: 0 };
let ghost = { x: 7, y: 5, type: 'Banshee', evidence: ['box', 'emf'], speed: 0.03 };
let isHunting = false;
let inventory = ["Flashlight", "Spirit Box", "Journal"];

// --- MAP DATA (0 = floor, 1 = wall) ---
const maps = {
    asylum: [[1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,1,1,1,0,1],[1,0,0,0,1,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1]]
};
let currentMap = maps.asylum;

// --- MOVEMENT & INPUT ---
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if(e.code === 'Digit1') player.item = 0;
    if(e.code === 'Digit2') player.item = 1;
    if(e.code === 'Digit3') player.item = 2;
    if(e.code === 'KeyJ') document.getElementById('journal').classList.toggle('hidden');
    updateHUD();
});
window.addEventListener('keyup', e => keys[e.code] = false);

function updateHUD() {
    document.getElementById('item').innerText = inventory[player.item];
    document.getElementById('spirit-box').classList.toggle('hidden', player.item !== 1);
}

// --- CORE ENGINE ---
function movePlayer() {
    let nextX = player.x;
    let nextY = player.y;
    const speed = 0.05;

    if (keys['KeyW']) { nextX += Math.cos(player.dir) * speed; nextY += Math.sin(player.dir) * speed; }
    if (keys['KeyS']) { nextX -= Math.cos(player.dir) * speed; nextY -= Math.sin(player.dir) * speed; }
    if (keys['KeyA']) player.dir -= 0.04;
    if (keys['KeyD']) player.dir += 0.04;

    // "Bugless" Collision Check (Slide against walls)
    if (currentMap[Math.floor(player.y)][Math.floor(nextX)] === 0) player.x = nextX;
    if (currentMap[Math.floor(nextY)][Math.floor(player.x)] === 0) player.y = nextY;
}

function ghostAI() {
    let dist = Math.hypot(ghost.x - player.x, ghost.y - player.y);
    
    // Hunting Logic
    if (player.sanity < 50 && dist < 3) {
        isHunting = true;
        // Ghost moves toward player
        ghost.x += (player.x - ghost.x) * 0.01;
        ghost.y += (player.y - ghost.y) * 0.01;
    }

    if (isHunting && dist < 0.3) {
        alert("The " + ghost.type + " caught you.");
        location.reload();
    }
}

// --- SPIRIT BOX LOGIC ---
document.getElementById('ghost-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const val = e.target.value.toLowerCase();
        const res = document.getElementById('spirit-response');
        if (Math.hypot(ghost.x - player.x, ghost.y - player.y) < 2) {
            res.innerText = "GHOST: 'KILL... NEAR...'";
            res.style.color = "red";
        } else {
            res.innerText = "Nothing heard.";
            res.style.color = "white";
        }
        e.target.value = "";
    }
});

function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    // [Raycasting Loop same as previous, but adds Ghost Sprite]
    // (Omitted for brevity, but you'd check distance to ghost and draw a red line if distance < 1)
}

function loop() {
    movePlayer();
    ghostAI();
    draw();
    requestAnimationFrame(loop);
}
loop();

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const BOX_SIZE = 20;

let playerId = null; // oyuncunun kendi ID'si
let players = {};

const ws = new WebSocket('ws://localhost:8080'); // Sunucuya bağlan

// Bağlantı kurulduğunda
ws.onopen = () => {
    console.log('[CLIENT] Connected to server');
};

// Sunucudan veri alındığında
ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'init') {
        playerId = msg.id;
        players = msg.players;
    } else if (msg.type === 'update') {
        players = msg.players;
    }
};

// Tuş basıldığında sunucuya gönder
window.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
        ws.send(JSON.stringify({ type: 'move', key }));
    }
});

// Oyuncuları çiz
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let id in players) {
        ctx.fillStyle = id === playerId ? 'white' : 'gray';
        ctx.fillRect(players[id].x, players[id].y, BOX_SIZE, BOX_SIZE);
    }

    requestAnimationFrame(draw);
}

draw();


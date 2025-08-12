// Sunucu tarafı
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Oyun değerleri
const BOX_SIZE = 20;
const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 300;

let players = {}; // obje olarak tutuyoruz

wss.on('connection', (ws) => {
    // Her oyuncu bağlandığında id üretir
    const id = Date.now() + Math.random().toString(36).substr(2, 5);

    // Oyuncular haritanın ortasında doğacaklar
    players[id] = {
        x: Math.floor((CANVAS_WIDTH - BOX_SIZE) / 2),
        y: Math.floor((CANVAS_HEIGHT - BOX_SIZE) / 2)
    };

    // İlk konumları gönder
    ws.send(JSON.stringify({ type: 'init', id, players }));
    console.log('[SERVER] player ' + id + ' joined');

    // Mesaj alındığında
    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);

            if (msg.type === 'move') {
                let player = players[id];
                if (!player) return;

                if (msg.key === 'w') player.y -= BOX_SIZE;
                if (msg.key === 's') player.y += BOX_SIZE;
                if (msg.key === 'a') player.x -= BOX_SIZE;
                if (msg.key === 'd') player.x += BOX_SIZE;

                // Sınır kontrolü
                if (player.x < 0) player.x = 0;
                if (player.y < 0) player.y = 0;
                if (player.x > CANVAS_WIDTH - BOX_SIZE) player.x = CANVAS_WIDTH - BOX_SIZE;
                if (player.y > CANVAS_HEIGHT - BOX_SIZE) player.y = CANVAS_HEIGHT - BOX_SIZE;

                broadcast({ type: 'update', players });
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Bağlantı kapandığında
    ws.on('close', () => {
        delete players[id];
        console.log('[SERVER] player ' + id + ' left');
        broadcast({ type: 'update', players });
    });
});

// Tüm oyunculara mesaj yolla
function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

console.log('[SERVER] Listening on ws://localhost:8080');


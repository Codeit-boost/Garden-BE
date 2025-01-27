const WebSocket = require('ws');
const { updateFocusTimeRealTime } = require('./focusTimeService.js');

const startWebSocketServer = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log("새 클라이언트가 연결되었습니다.");

        ws.on('message', (message) => {
            console.log(`클라이언트 메시지: ${message}`);
        });

        ws.on('close', () => {
            console.log("클라이언트 연결이 종료되었습니다.");
        });
    });

    // 주기적으로 집중시간 업데이트 및 클라이언트에게 푸시
    setInterval(async () => {
        const updates = await updateFocusTimeRealTime();

        if (updates.length > 0) {
            // 모든 클라이언트에게 변경사항 푸시
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.open) {
                    client.send(JSON.stringify({ updates }));
                }
            });
        }
    }, 10000);  // 10초마다 실행
};

module.exports = { startWebSocketServer };
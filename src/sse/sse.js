const { ErrorCodes, CustomError } = require('../utils/error');

const clients =  [];

// 25초마다 heartbeat 전송
setInterval(() => {
    clients.forEach(client => { 
        try {
            client.sseClient.write(":\n\n"); // SSE 연결 유지 (Ping 역할)
        } catch (error) {
            removeClient(client.sseClient); // ❗ 오류 발생 시 해당 클라이언트만 제거
        }
    });
}, 25 * 1000);

// 새로운 SSE 연결 추가
const addClient = (id, res) => {
    // SSE 헤더 설정
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    console.log("📡 클라이언트와 SSE 연결이 설정되었습니다.");

    clients.push({id: id, sseClient: res});
    console.log("✅ 클라이언트 연결됨. 현재 연결된 클라이언트:", clients.length);
    
    // 클라이언트가 연결을 종료할 경우 (브라우저 종료, 네트워크 끊김 등)
    res.on("close", () => {
        console.log("클라이언트 연결 해제됌")
        removeClient(res);
    });
};


// 연결이 종료된 클라이언트 제거
const removeClient = (res) => {
    const index = clients.findIndex(client => client.sseClient == res);
    if (index !== -1) {
        clients.splice(index, 1);
    }
};

// 특정 클라이언트로 데이터 전송
const broadcast = (id, data) => {
    const targetClients = clients.filter(client => client.id === id);

    if (targetClients.length == 0) {
        console.log(`데이터 전송 실패: ID ${id}에 해당하는 클라이언트가 없습니다.`);
        return false;
    }

    targetClients.forEach(client => {
        try {
            if(data){
                client.sseClient.write(`data: ${JSON.stringify(data)}\n\n`);
            }else{
                client.sseClient.write(":\n\n");
            }
            console.log(`데이터 전송 성공 (ID: ${id})`);
        } catch (error) {
            console.log(`데이터 전송 실패 (ID: ${id}):`, error);
            removeClient(client.sseClient); // 오류 발생 시 해당 클라이언트만 제거
        }
    });
    return true;
};

// 주어진 id로 현재 SSE 연결 중인 클라이언스가 있는지 여부를 반환하는 함수
const isClientConnected = (id) => {
    return clients.some(client => client.id == id);
};

module.exports = { addClient, removeClient, broadcast, isClientConnected };

/**
 * 클라이언트 측 간략한 test 코드
 */

/*
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Focus Time Tracker</title>
</head>
<body>
    <h1>🌱 집중 시간 실시간 트래커</h1>
    <div id="focusTimeData">데이터 수신 대기 중...</div>

    <script>
        const eventSource = new EventSource("http://localhost:3000/api/focusTime/stream");

        eventSource.onopen = () => {
        console.log("✅ SSE 연결 성공");
        };

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📡 데이터 수신:", data);

            document.getElementById("focusTimeData").innerText = 
            `집중시간 id: ${data.id}, 목표 시간: ${data.targetTime}, 누적 시간: ${data.time}`;
        };

        eventSource.onerror = (error) => {
            console.error("❌ 연결 오류:", error);
            
            // ✅ 오류 발생 시 서버에서 전송한 메시지 확인
            if (error.currentTarget.readyState === EventSource.CLOSED) {
                console.warn("🚫 SSE 연결이 종료되었습니다.");
            } else {
                console.warn("⚠️ 연결 상태:", error.currentTarget.readyState);
            }
        };
    </script>
</body>
</html>
*/
const clients = [];

// 새로운 SSE 연결 추가
const addClient = (res) => {
    clients.push(res);
    console.log("✅ 클라이언트 연결됨. 현재 연결된 클라이언트 수:", clients.length);
};

// 연결이 종료된 클라이언트 제거
const removeClient = (res) => {
    const index = clients.indexOf(res);
    if (index !== -1) {
        clients.splice(index, 1);
        console.log("❎ 클라이언트 연결 종료됨. 남은 클라이언트 수:", clients.length);
    }
};

// 모든 클라이언트로 데이터 전송
const broadcast = (data) => {
    console.log("📡 데이터 브로드캐스트 시작:", data); // ✅ 로깅 추가

    clients.forEach((client, index) => {
        try {
            client.write(`data: ${JSON.stringify(data)}\n\n`);
            console.log(`✅ 데이터 전송 성공 (클라이언트 #${index + 1})`);
        } catch (error) {
            console.error(`❌ 데이터 전송 실패 (클라이언트 #${index + 1}):`, error);
            removeClient(client); // ❗ 오류 발생 시 클라이언트 제거
        }
    });
};

module.exports = { addClient, removeClient, broadcast };



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
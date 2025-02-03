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
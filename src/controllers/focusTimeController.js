const focusTimeService = require("../services/focusTimeService.js");
const s = require("superstruct");
const { CreateFocusTime, UpdateFocusTimeCategory } = require("../struct/focusTimeStruct.js");
const { addClient, removeClient, broadcast } = require("../utils/sseConnections.js");


/**
 * 집중시간 생성
 */
const createFocusTime = async (req, res) => {
    s.assert(req.body, CreateFocusTime);
    const memberId = req.user.id;
    const focusTime = await focusTimeService.createFocusTime(memberId, req.body);
    res.status(201).json(focusTime);
};


/**
 * 집중시간 세부 조회
 */
const focusTimeDetail = async (req, res) => {
    const { focusTimeId } = req.params;
    const focusTime = await focusTimeService.getFocusTimeById(focusTimeId);
    res.status(200).json(focusTime);
};


/**
 * 집중시간 카테고리 수정
 */
const updateFocusTimeCategory = async (req, res) => {
    const { focusTimeId } = req.params;
    s.assert(req.body, UpdateFocusTimeCategory);
    
    // req.body에서 category 값 추출
    const updatedFocusTimeCategory = req.body.category;

    const updatedFocusTime = await focusTimeService.updateFocusTimeCategoryById(
        focusTimeId,
        updatedFocusTimeCategory
    );
    res.status(200).json(updatedFocusTime);
};


/**
 * 타이머 모드 집중시간 포기
 */
const cancelFocusTime = async (req, res) => {
    const { focusTimeId } = req.params;
    const canceledFocusTime = await focusTimeService.cancelFocusTimeById(focusTimeId);
    res.status(200).json(canceledFocusTime);
};


/**
 * 실시간 집중시간 정보 업데이트
 */
const updateFocusTimeRealTime = async (req, res, next) => {

    const memberId = req.user.id;   //미션업데이트용 사용자 id 받기  ---> 추가함✅

    // 요청 데이터 확인
    if (req.body && Object.keys(req.body).length > 0) {
        return res.status(400).json({
            message: "이 API는 요청 데이터를 받지 않습니다."
        });
    }

    const updates = await focusTimeService.updateFocusTimeRealTime(memberId);

    if (updates.length === 0) {
        return res.status(200).json({ message: "변경된 데이터가 없습니다."});
    }

    return res.status(200).json({
        message: "집중시간이 업데이트되었습니다.",
        updates,
    });
};


/**
 * SSE 연결 및 실시간 집중시간 데이터 전송
 */
const focusTimeSSE = async (req, res, next) => {
    
    // SSE 헤더 설정
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    console.log("📡 클라이언트와 SSE 연결이 설정되었습니다.");
    
    // 새로운 클라이언트 연결 추가
    addClient(res);

    // 초기 연결 시 데이터 전송 (연결 확인용)
    res.write(`data: ${JSON.stringify({ message: "SSE 연결이 성공적으로 설정되었습니다." })}\n\n`);
    
    // 15초마다 heartbeat 전송
    const heartbeat = setInterval(() => {
        res.write(":\n\n"); // 빈 이벤트로 연결 유지
    }, 15000);

    // 1초마다 집중시간 상태 업데이트
    setInterval(async () => {
        try {
            const updates = await focusTimeService.updateFocusTimeRealTime();
        } catch (error) {
            next(error);
            console.log("❌ 오류 발생", error);
        }
    }, 1000);

    // 클라이언트 연결이 종료될 경우 처리
    req.on("close", () => {
        console.log("❎ 클라이언트와의 SSE 연결이 종료되었습니다.");
        clearInterval(heartbeat);
        removeClient(res);
        res.end();
    });
};


module.exports = {
    createFocusTime,
    focusTimeDetail,
    updateFocusTimeCategory,
    updateFocusTimeRealTime,
    cancelFocusTime,
    focusTimeSSE
};
const focusTimeService = require("../services/focusTimeService.js");
const s = require("superstruct");
const { CreateFocusTime, UpdateFocusTimeCategory } = require("../struct/focusTimeStruct.js");
const sse = require("../sse/sse.js");
const { scheduleFocusTimeEvent, getEventData,removeEventsByMemberId} = require("../background/focusTimeWorker")

/**
 * 집중시간 생성
 */
const createFocusTime = async (req, res) => {
    s.assert(req.body, CreateFocusTime);
    const memberId = req.user.id;
    const focusTime = await focusTimeService.createFocusTime(memberId, req.body);
    scheduleFocusTimeEvent(memberId, focusTime.data, 1);
    sse.broadcast(memberId, focusTime.data);
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
    const memberId = req.user.id;
    const { focusTimeId } = req.params;
    removeEventsByMemberId(memberId);
    const endFocusTime = await focusTimeService.endFocusTimeById(memberId, focusTimeId);
    res.status(200).json(endFocusTime);
};

/**
 * 스탑워치 모드 집중시간 종료
 */
const endFocusTime = async (req, res) => {
    const memberId = req.user.id;
    const { focusTimeId } = req.params;
    const endFocusTime = await focusTimeService.endFocusTimeById(memberId, focusTimeId);
    if(endFocusTime){ // 데이터 베이스에서 종료가 되면 이벤트에서 삭제
        await removeEventsByMemberId(memberId);
    }
    res.status(200).json(endFocusTime);
};
// /**
//  * 실시간 집중시간 정보 업데이트
//  */
// const updateFocusTimeRealTime = async (req, res, next) => {
  
//     // 요청 데이터 확인
//     if (req.body && Object.keys(req.body).length > 0) {
//         return res.status(400).json({
//             message: "이 API는 요청 데이터를 받지 않습니다."
//         });
//     }

//     const updates = await focusTimeService.updateFocusTimeRealTime();

//     if (updates.length === 0) {
//         return res.status(200).json({ message: "변경된 데이터가 없습니다."});
//     }

//     return res.status(200).json({
//         message: "집중시간이 업데이트되었습니다.",
//         updates,
//     });
// };


/**
 * SSE 연결 및 실시간 집중시간 데이터 전송
 */
const focusTimeSSE = async (req, res, next) => {
    // 새로운 클라이언트 연결 추가
    userId = req.user.id;
    await sse.addClient(userId, res);
    const data = await getEventData(userId);

    // sse 최초 연결 시 현재 진행중인 집중시간 조회
    await focusTimeService.broadcastNowFocusTime(userId,data);
};


module.exports = {
    createFocusTime,
    focusTimeDetail,
    updateFocusTimeCategory,
    cancelFocusTime,
    endFocusTime,
    focusTimeSSE
};
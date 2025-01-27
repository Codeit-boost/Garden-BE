const focusTimeService = require("../services/focusTimeService.js");
const s = require("superstruct");
const { CreateFocusTime, UpdateFocusTimeCategory } = require("../struct/focusTimeStruct.js");

/**
 * 집중시간 생성
 */
const createFocusTime = async (req, res) => {
    s.assert(req.body, CreateFocusTime);
    const focusTime = await focusTimeService.createFocusTime(req.body);
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
 * 실시간 업데이트 처리 및 응답
 */
const updateFocusTime = async (req, res, next) => {
    try {
        const updates = await focusTimeService.updateFocusTimeRealTime();

        if (updates.length === 0) {
            return res.status(200).json({ message: "변경된 데이터가 없습니다."});
        }
        return res.status(200).json({
            message: "집중시간이 업데이트되었습니다.",
            updates
        });
    } catch (error) {
        next(error);
    }
};


/**
 * 타이머 모드 집중시간 포기
 */
const cancelFocusTime = async (req, res) => {
    const { focusTimeId } = req.params;
    const canceledFocusTime = await focusTimeService.cancelFocusTimeById(focusTimeId);
    res.status(200).json(canceledFocusTime);
};


module.exports = {
    createFocusTime,
    focusTimeDetail,
    updateFocusTimeCategory,
    updateFocusTime,
    cancelFocusTime
};
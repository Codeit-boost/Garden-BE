const s = require("superstruct")

/**
 * 집중시간 생성에 사용할 구조체
 */
const CreateFocusTime = s.object({
    target_time: s.string(),
    flower_id: s.integer(),
    category: s.string()
});


/**
 * 집중시간 카테고리 수정에 사용할 구조체
 */
const UpdateFocusTimeCategory = s.object({
    category: s.string()
});


module.exports = {
    CreateFocusTime,
    UpdateFocusTimeCategory
};
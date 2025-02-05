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

// 집중시간 반환 구조체(진행 중)
const FocusTimeInProgress = s.object({
    id: s.string(),
    category: s.string(),
    target_time: s.string(),
    time: s.string(),
    currentFlowerImage: s.string(),
    flower_id: s.string(),
    member_id: s.string(),
    createdAt: s.string(),
    state: s.string(),
    time: s.string() 
})

module.exports = {
    CreateFocusTime,
    FocusTimeInProgress,
    UpdateFocusTimeCategory
};
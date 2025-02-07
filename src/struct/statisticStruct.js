const s = require("superstruct")

// 날짜 범위 구조체
const DateRange = s.object({
    startDate: s.string(),  // YYYY-MM-DD 형식
    endDate: s.string()     // YYYY-MM-DD 형식
});

// 통계 쿼리 구조체
const StatisticsQuery = s.object({
    type: s.enums(['daily', 'weekly', 'monthly']),
    year: s.integer(),
    month: s.optional(s.integer()),
    day: s.optional(s.integer()),
    week: s.optional(s.integer())
});

const GardenResponse = s.object({
  name: s.string(),
  language: s.string(),
  FlowerImg: s.optional(s.string()),
});

module.exports = {
    DateRange,
    StatisticsQuery,
    GardenResponse
};
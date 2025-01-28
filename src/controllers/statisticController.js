const statisticService = require('../services/statisticService');
const { StatisticQuery } = require('../struct/statisticStruct');
const s = require("superstruct");

const getStatistic = async (req, res) => {
    s.assert(req.query, StatisticQuery);
    
    const { type, year, month, day, week } = req.query;
    const memberId = req.user.id;

    let startDate, endDate;

    switch(type) {
        case 'daily':
            startDate = new Date(year, month-1, day);
            endDate = new Date(year, month-1, day, 23, 59, 59);
            break;
            
        case 'weekly':
            // 월요일부터 시작하는 주차 계산
            const firstDayOfMonth = new Date(year, month-1, 1);
            const offset = firstDayOfMonth.getDay() - 1;  // 월요일 기준
            startDate = new Date(year, month-1, (week-1)*7 + 1 - offset);
            endDate = new Date(year, month-1, (week-1)*7 + 7 - offset, 23, 59, 59);
            break;
            
        case 'monthly':
            startDate = new Date(year, month-1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59);
            break;
    }

    const [timeDistribution, categoryAnalysis, flowerAnalysis] = await Promise.all([
        statisticService.getTimeDistribution(memberId, type, startDate, endDate),
        statisticService.getCategoryAnalysis(memberId, startDate, endDate),
        statisticService.getFlowerAnalysis(memberId, startDate, endDate)
    ]);

    res.json({
        timeDistribution,
        categoryAnalysis,
        flowerAnalysis,
        period: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        }
    });
};

module.exports = {
    getStatistic
};
const statisticService = require('../services/statisticService');
const { StatisticsQuery } = require('../struct/statisticStruct');
const s = require("superstruct");

const getStatistic = async (req, res) => {
    const memberId = req.user.id;
    
    const { type, year, month, day, week } = req.query;
    
    // 숫자로 변환 (값이 없을 경우 NaN 방지)
    const yearNum = year ? parseInt(year, 10) : undefined;
    const monthNum = month ? parseInt(month, 10) : undefined;
    const dayNum = day ? parseInt(day, 10) : undefined;
    const weekNum = week ? parseInt(week, 10) : undefined;

    // Superstruct 검증
    s.assert({ type, year: yearNum, month: monthNum, day: dayNum, week: weekNum }, StatisticsQuery);

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
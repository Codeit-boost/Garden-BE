const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 시간 통계 막대그래프 조회
const getTimeDistribution = async (memberId, type, startDate, endDate) => {
    const focusTimes = await prisma.focusTime.findMany({
        where: {
            memberId: memberId,
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        }
    });

    let distribution = {};
    
    switch(type) {
        case 'daily':
            // 3시간 단위로 분배
            distribution = {
                '0-3': 0, '3-6': 0, '6-9': 0, '9-12': 0,
                '12-15': 0, '15-18': 0, '18-21': 0, '21-24': 0
            };
            
            focusTimes.forEach(focus => {
                const hour = focus.createdAt.getHours();
                const timeSlot = `${Math.floor(hour/3)*3}-${Math.floor(hour/3)*3+3}`;
                distribution[timeSlot] += focus.time;
            });
            break;

        case 'weekly':
            // 요일별 분배
            distribution = {
                'MON': 0, 'TUE': 0, 'WED': 0, 'THU': 0,
                'FRI': 0, 'SAT': 0, 'SUN': 0
            };
            
            focusTimes.forEach(focus => {
                const day = focus.createdAt.getDay();
                const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                distribution[days[day]] += focus.time;
            });
            break;

        case 'monthly':
            // 월별 분배
            distribution = {};
            for(let i = 1; i <= 12; i++) {
                distribution[i] = 0;
            }
            
            focusTimes.forEach(focus => {
                const month = focus.createdAt.getMonth() + 1;
                // 분 단위를 시간 단위로 변환
                distribution[month] = Math.round((distribution[month] + focus.time) / 60 * 100) / 100;
            });
            break;
    }

    return distribution;
};

// 카테고리별 통계 원그래프 조회
const getCategoryAnalysis = async (memberId, startDate, endDate) => {
    const focusTimes = await prisma.focusTime.findMany({
        where: {
            memberId: memberId,
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        }
    });

    const categoryStats = {};

    // `focusTimes` 순회하며 동일한 카테고리끼리 그룹화
    focusTimes.forEach(focus => {
        const category = focus.category; // 문자열 카테고리
        
        if (!categoryStats[category]) {
            categoryStats[category] = { time: 0, count: 0 };
        }
    
        categoryStats[category].time += focus.time;
        categoryStats[category].count += 1;
    });
    
    const total = Object.values(categoryStats).reduce((acc, curr) => acc + curr.time, 0);
    
    return Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        percentage: (stats.time / total) * 100,
        time: stats.time,
        count: stats.count
    }));
};

// 꽃별 통계 조회
const getFlowerAnalysis = async (memberId, startDate, endDate) => {
    const focusTimes = await prisma.focusTime.findMany({
        where: {
            memberId: memberId,
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        include: {
            flower: true
        }
    });

    const flowerStats = {};

    for (const focus of focusTimes) {
        if (!flowerStats[focus.flowerId]) {
            flowerStats[focus.flowerId] = {
                name: focus.flower.name,
                floriography: await prisma.floriography.findFirst({
                    where: { flower: focus.flower.name }
                }),
                totalCount: 0,
                bloomedCount: 0,
                wiltedCount: 0
            };
        }

        flowerStats[focus.flowerId].totalCount += 1;
        if (focus.state === 'BLOOMED') {
            flowerStats[focus.flowerId].bloomedCount += 1;
        } else if (focus.state === 'WILTED') {
            flowerStats[focus.flowerId].wiltedCount += 1;
        }
    }

    return Object.values(flowerStats)
        .sort((a, b) => b.totalCount - a.totalCount);
};

module.exports = {
    getTimeDistribution,
    getCategoryAnalysis,
    getFlowerAnalysis
};
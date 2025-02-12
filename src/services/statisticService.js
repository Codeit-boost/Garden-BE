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
                // UTC -> KST 변환 (UTC + 9시간)
                const kstDate = new Date(focus.createdAt.getTime() + 9 * 60 * 60 * 1000);
                const hour = kstDate.getHours();
                const timeSlot = `${Math.floor(hour/3)*3}-${Math.floor(hour/3)*3+3}`;
                distribution[timeSlot] += focus.time;
            });
            
            // 초 -> 분 변환
            Object.keys(distribution).forEach(slot => {
                distribution[slot] = Math.round(distribution[slot] / 60);
            });
            break;

        case 'weekly':
            // 요일별 분배
            distribution = {
                '월': 0, '화': 0, '수': 0, '목': 0,
                '금': 0, '토': 0, '일': 0
            };
            
            focusTimes.forEach(focus => {
                // UTC -> KST 변환
                const kstDate = new Date(focus.createdAt.getTime() + 9 * 60 * 60 * 1000);
                const day = kstDate.getDay();
                const days = ['일', '월', '화', '수', '목', '금', '토'];
                distribution[days[day]] += focus.time;
            });
            
            // 초 -> 시간 변환
            Object.keys(distribution).forEach(day => {
                distribution[day] = Math.round((distribution[day] / 3600) * 100) / 100;
            });
            break;

        case 'monthly':
            // 월별 분배
            distribution = {};
            for(let i = 1; i <= 12; i++) {
                distribution[i] = 0;
            }
            
            focusTimes.forEach(focus => {
                // UTC -> KST 변환
                const kstDate = new Date(focus.createdAt.getTime() + 9 * 60 * 60 * 1000);
                const month = kstDate.getMonth() + 1;
                distribution[month] += focus.time;
            });
            
            // 초 -> 시간 변환
            Object.keys(distribution).forEach(month => {
                distribution[month] = Math.round((distribution[month] / 3600) * 100) / 100;
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
                floriography: focus.flower.language,
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

const getMyGarden = async (memberId) => {
  // 사용자가 심은 꽃들 중 완전히 핀(BLOOMED) 꽃들을 조회
  const bloomedFlowers = await prisma.focusTime.findMany({
      where: {
          memberId: memberId,
          state: 'BLOOMED'
      },
      include: {
          flower: true
      },
      distinct: ['flowerId'],  // 꽃 ID로 중복 제거
  });

  // 꽃 정보만 추출
  return bloomedFlowers.map(focusTime => ({
      name: focusTime.flower.name,
      language: focusTime.flower.language,
      FlowerImg: focusTime.flower.FlowerImg
  }));
};



module.exports = {
    getTimeDistribution,
    getCategoryAnalysis,
    getFlowerAnalysis,
    getMyGarden
};
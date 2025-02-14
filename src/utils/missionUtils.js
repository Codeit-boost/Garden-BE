const { PrismaClient } = require('@prisma/client');
const calculateTime = require('../utils/calculateTime');

const prisma = new PrismaClient();

/**
 * current value 계산 함수
 */
const calculateCurrentValue = async (memberId, mission) => {
    switch(mission.mission.type){
        case 'CONSECUTIVE_PLANTING':
            return await calculateConsecutivePlantingMissionValue(memberId, mission);
        case 'FOCUS_TIME':
            return await calculateFocusTimeMissionValue(memberId);
        case 'TOTAL_FLOWERS':
            return await calculateTotalFlowersMissionValue(memberId);
        default:
            return 0;
    }
}

/**
 * 연속 심기 미션 currentValue 계산
 */
const calculateConsecutivePlantingMissionValue = async(memberId, mission) => {
    if (!mission.startDate) return 0;

    // UTC -> KST 변환
    const kstOffset = 9 * 60 * 60 * 1000;
    const today = new Date(new Date(Date.now() + kstOffset).setHours(0, 0, 0, 0));
    const startDate = new Date(new Date(mission.startDate.getTime() + kstOffset).setHours(0, 0, 0, 0));
    
    //오늘 focusTime 있는지 확인
    const todayFocusCount = await prisma.focusTime.count({
        where:{
            memberId: Number(memberId),
            createdAt:{
                gte: new Date(today.getTime() - kstOffset),
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000 - kstOffset),
            },
        },
    });

    //오늘 focusTime 없으면 streak는 0
    if (todayFocusCount === 0) return 0;

    // 연속 기록 일수 계산
    const days = Math.floor((today - startDate) / (24 * 60 * 60 * 1000)) + 1;

    return days;
}

/**
 * 총 집중시간 미션 currentValue 계산
 */
const calculateFocusTimeMissionValue = async(memberId) => {
    const totalFocusedTime = await prisma.focusTime.aggregate({
        where: { memberId },
        _sum: { time: true },       //모든 집중 시간 합 계산
    });

    const focusedTime = calculateTime.convertTimeToHours(totalFocusedTime._sum.time);   //합에서 시간만

    return focusedTime || 0;
}

/**
 * 심은꽃 미션 currentValue 계산
 */
const calculateTotalFlowersMissionValue = async(memberId) => {
    const uniqueFlowers = await prisma.focusTime.findMany({
        where: { memberId },
        select: { flowerId: true},
        distinct: ['flowerId'],
    });
    return uniqueFlowers.length;
}

/**
 * 미션에 해당하는 꽃 unlock
 */
const unlockFlower = async(memberId, flowerId) => {
    await prisma.memberFlower.update({
        where: {
            memberId_flowerId: {
                memberId,
                flowerId,
            },
        },
        data: {
            unlocked: true,
        },
    });
}

module.exports = {
    calculateCurrentValue,
    calculateConsecutivePlantingMissionValue,
    calculateFocusTimeMissionValue,
    calculateTotalFlowersMissionValue,
    unlockFlower
}
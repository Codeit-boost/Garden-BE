const { PrismaClient } = require("@prisma/client");
const prisma = require("../middlewares/prismaMiddleware");

/**
 * 목표시간 1/4 단위(타이머) 또는 45분 단위(스톱워치)로 time 업데이트
 * 누적 집중시간이 목표 집중시간을 달성하면 상태를 BLOOMED로 변경
 */
const updateState = async (focusTime, elapsedTime) => {

    let newState = focusTime.state;
    let shouldUpdate = false;
    let lastUpdatedTime = focusTime.time;
    let newTime;

    // 타이머 모드
    if (focusTime.targetTime) {
        const quarter = focusTime.targetTime / 4;   // 목표 시간의 1/4 값
        
        // 1/4, 2/4, 3/4 지점을 넘어섰으면 time 업데이트
        if (elapsedTime >= quarter * 1 && lastUpdatedTime < quarter * 1) {
            newTime = quarter * 1;
            shouldUpdate = true;
        } else if (elapsedTime >= quarter * 2 && lastUpdatedTime < quarter * 2) {
            newTime = quarter * 2;
            shouldUpdate = true;
        } else if (elapsedTime >= quarter * 3 && lastUpdatedTime < quarter * 3) {
            newTime = quarter * 3;
            shouldUpdate = true;
        }
        
        // 목표 시간 도달 시 BLOOMED 상태로 변경
        if (elapsedTime >= focusTime.targetTime) {
            newState = "BLOOMED";
            newTime = focusTime.targetTime;
            shouldUpdate = true;
        }
    }

    // 스톱워치 모드
    else {
        const interval = 2700;  // 45분(2700초)
        const maxTime = 10800;  // 3시간(10800초)
    
        // 45분 간격을 넘어섰으면 time 45분 단위로 업데이트
        if (elapsedTime >= lastUpdatedTime + interval) {
            newTime = lastUpdatedTime + interval;
            shouldUpdate = true;
        }

        // 3시간 도달 시 BLOOMED 상태로 변경
        if (elapsedTime >= maxTime) {
            newState = "BLOOMED";
            updatedTime = maxTime;
            shouldUpdate = true;
        }
    }

    // 상태 또는 time 업데이트가 필요하면 DB 업데이트
    if (shouldUpdate || newState != focusTime.state) {
        await prisma.focusTime.update({
            where: { id: focusTime.id },
            data: {
                time: newTime,
                state: newState
            }
        });
    }

    return newState;
};

module.exports = {
    updateState
};
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * 누적 집중시간이 목표 집중시간을 달성하여 상태를 BLOOMED로 변경하는 함수
 */
const updateStateToBloomed = async (focusTime, elapsedTime) => {

    let newState = focusTime.state;

    // 타이머 모드
    if (focusTime.targetTime && elapsedTime >= focusTime.targetTime)
        newState = "BLOOMED";

    // 스톱워치 모드
    else if (!focusTime.targetTime && elapsedTime >= 180)
        newState = "BLOOMED";

    // 상태가 BLOOMED로 변경되면 DB에 업데이트
    if (newState != focusTime.state) {
        await prisma.focusTime.update({
            where: { id: focusTime.id },
            data: { state: newState }
        });
    }

    return newState;
};

module.exports = {
    updateStateToBloomed
};
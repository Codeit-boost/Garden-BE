require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const { errorMiddleware } = require("../middlewares/errorMiddleware.js");
const { calculateElapsedTime } = require("../utils/calculateTime.js");
const { updateFlowerId } = require("../utils/updateFlowerImage.js");
const prisma = new PrismaClient();

/**
 * 집중시간 생성
 */
const createFocusTime = async (focusTimeData) => {
    try {
        const { category, target_time, flower_id, member_id } = focusTimeData;

        return await prisma.focusTime.create({
            data: {
                category: category,
                targetTime: target_time,    // 타이머 모드: target_time 지정, 스톱워치 모드: target_time 값 null
                time: 0,    // 초기 누적 집중 시간은 0
                flowerId: flower_id,
                memberId: member_id,
                state: "IN_PROGRESS"    // 기본 상태는 IN_PROGRESS
            },
            include: {
                flower: true,   // 연관된 꽃 정보 포함
                member: true    // 연관된 회원 정보 포함
            }
        });
    } catch (error) {
        console.error("Error creating focus time:", error);
        throw error
    }
};


/**
 * 집중시간 세부 조회
 */
const getFocusTimeById = async (focusTimeId) => {
    const parsedFocusTimeId = parseInt(focusTimeId, 10);
    
    const focusTime = await prisma.focusTime.findUnique({
        where: { id: parsedFocusTimeId },
        include: {
            flower: true,
            member: true
        }
    });

    if (!focusTime) {
        throw new NotFoundError("해당 집중시간 정보가 존재하지 않습니다.");
    }

    const time = calculateElapsedTime(focusTime.createdAt, focusTime.targetTime);

    return {
        data: {
            id: focusTime.id,
            category: focusTime.category,
            target_time: focusTime.targetTime,
            time: time,  // 계산된 누적 집중시간
            flower_id: focusTime.flowerId,
            member_id: focusTime.memberId,
            createdAt: focusTime.createdAt,
            state: focusTime.state
        },
        include: {
            flower: true,
            member: true
        }
    };
};


/**
 * 카테고리 변경
 */
const updateFocusTimeCategoryById = async (focusTimeId, updatedFocusTimeCategory) => {
    const parsedFocusTimeId = parseInt(focusTimeId, 10);

    // focusTimeId에 해당하는 집중시간 객체 탐색
    const focusTime = await prisma.focusTime.findUnique({
        where: { id: parsedFocusTimeId },
        include: {
            flower: true,
            member: true
        }
    });

    if (!focusTime) {
        throw new NotFoundError("해당 집중시간 정보가 존재하지 않습니다.");
    }

    // 집중시간 카테고리 정보 수정
    const updatedFocusTime = await prisma.focusTime.update({
        where: { id: parsedFocusTimeId },
        data: { category: updatedFocusTimeCategory },
        include: {
            flower: true,
            member: true
        }
    });

    // 업데이트된 focusTime 객체 반환
    return {
        data: {
            id: updatedFocusTime.id,
            category: updatedFocusTime.category,
            target_time: updatedFocusTime.targetTime,
            time: updatedFocusTime.time,
            flower_id: updatedFocusTime.flowerId,
            member_id: updatedFocusTime.memberId,
            createdAt: updatedFocusTime.createdAt,
            state: updatedFocusTime.state
        },
        include: {
            flower: true,
            member: true
        }
    };
};


/**
 * 실시간 집중시간 및 꽃 사진 업데이트
 */
const updateFocusTimeRealTime = async () => {
    const focusTimes = await prisma.focusTime.findMany({
        where: { state: 'IN_PROGRESS' }
    });

    const updates = focusTimes.map(async (focusTime) => {
        const elapsedTime = calculateElapsedTime(focusTime.createdAt, focusTime.targetTime);
        const updatedFlowerId = updateFlowerId(elapsedTime, focusTime.targetTime, focusTime.flowerId);
        
        // flowerId가 변경되면 해당 flowerId로 업데이트
        if (updatedFlowerId !== focusTime.flowerId) {
            await prisma.focusTime.update({
                where: { id: focusTime.id },
                data: { flowerId: updateFlowerId }
            });
            return { id: focusTime.id, elapsedTime, flowerId: updateFlowerId }
        }
        return null;
    });

    // 업데이트된 데이터 반환
    return (await Promise.all(updates)).filter((update) => update !== null);
};


/**
 * 타이머 모드 집중시간 포기
 */
const cancelFocusTimeById = async (focusTimeId) => {
    const parsedFocusTimeId = parseInt(focusTimeId, 10);

    // focusTimeId에 해당하는 집중시간 객체 탐색
    const focusTime = await prisma.focusTime.findUnique({
        where: { id: parsedFocusTimeId },
        include: {
            flower: true,
            member: true
        }
    });

    if (!focusTime) {
        throw new NotFoundError("해당 집중시간 정보가 존재하지 않습니다.");
    }

    // 타이머 모드일 경우에만 진행
    if (focusTime.state === 'IN_PROGRESS' && focusTime.targetTime) {
        // 시든 이미지 가져오기
        const flower = await prisma.flower.findUnique({
            where: { id: focusTime.flowerId }
        });

        const canceledFocusTime = await prisma.focusTime.update({
            where: { id: parsedFocusTimeId },
            data: {
                state: 'WILTED',
                time: 0,
                flowerId: focusTime.flowerId
            },
            include: {
                flower: true,
                member: true
            }
        });
    
        return {
            data: {
                id: canceledFocusTime.id,
                category: canceledFocusTime.category,
                target_time: canceledFocusTime.targetTime,
                time: canceledFocusTime.time,
                flower_id: canceledFocusTime.flowerId,
                member_id: canceledFocusTime.memberId,
                createdAt: canceledFocusTime.createdAt,
                state: canceledFocusTime.state
            },
            include: {
                flower: true,
                member: true
            }
        };
    }
}



module.exports = {
    createFocusTime,
    getFocusTimeById,
    updateFocusTimeCategoryById,
    updateFocusTimeRealTime,
    cancelFocusTimeById
};
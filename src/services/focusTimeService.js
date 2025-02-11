const { PrismaClient } = require("@prisma/client");
const { calculateElapsedTime, convertSecondsToString, convertStringToSeconds } = require("../utils/calculateTime.js");
const { getUpdatedFlowerImage,getWitherImg } = require("../utils/updateFlowerImage.js");
const { updateState } = require("../utils/updateFocusTimeState.js");
const { ErrorCodes, CustomError } = require('../utils/error');
const sse = require("../sse/sse.js");
const missionService = require('../services/missionService');

const STOPWATCH = process.env.STOPWATCH;

const prisma = new PrismaClient();

// 서버가 다운 됐을떄 실행중이였던 모든 집중시간 일괄 시듦 상태로 업데이트
// 집중 시간 데이터 초기 관리
const initFocusTimes = async () => {
  const focusTimes = await prisma.focusTime.findMany({
    where: { state: 'IN_PROGRESS' },
  });

  // 각 집중 시간을 'WILTED' 상태로 변경
  const updates = await Promise.all(
    focusTimes.map(async (focusTime) => {
      return prisma.focusTime.update({
        where: { id: focusTime.id },
        data: { state: 'WILTED' },
      });
    })
  );
};

// initFocusTimes();

/**
 * 집중시간 생성
 */
const createFocusTime = async (memberId, focusTimeData) => {
    try {
        const member_id = memberId;
        const { category, target_time, flower_id } = focusTimeData;

        // 진행중인 집중시간이 있다면 실행이 되지 않게
        if( await prisma.focusTime.findFirst({
            where: { 
                memberId: memberId,
                state: "IN_PROGRESS" 
            },
        })
        ){
            throw new CustomError(ErrorCodes.Conflict , "진행중인 집중 시간 존재") 
        }

        // requestBody로 받은 target_time을 HH:MM:SS 형태에서 초 단위로 변환
        const targetTimeInSeconds = convertStringToSeconds(target_time);

        const focusTime = await prisma.focusTime.create({
            data: {
                category: category,
                targetTime: targetTimeInSeconds,    // 타이머 모드: target_time 지정, 스톱워치 모드: target_time 값 0
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

        // 서버와 클라이언트 시간 동기화를 위해 현재 서버 시간을 넘겨줌
        const now = Date.now()

        return {
            data: {
                id: focusTime.id,
                category: focusTime.category,
                target_time: convertSecondsToString(focusTime.targetTime),
                time: convertSecondsToString(focusTime.time),
                currentFlowerImage: getUpdatedFlowerImage( 1 , focusTime.flower.FlowerImage),
                FlowerImage: focusTime.flower.FlowerImg,
                FlowerName: focusTime.flower.name,
                member_id: focusTime.memberId,
                createdAt: focusTime.createdAt,
                now: now
            },
            include: {
                member: focusTime.member
            }
        };
    } catch (error) {
        console.error("Error creating focus time:", error);
        throw error;
    }
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
        throw new CustomError(ErrorCodes.NotFound, "해당 집중시간 정보가 존재하지 않습니다.");
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
            id: focusTime.id,
            category: focusTime.category,
            target_time: convertSecondsToString(focusTime.targetTime),
            time: convertSecondsToString(focusTime.time),
            currentFlowerImage: getUpdatedFlowerImage(1,focusTime.flower.FlowerImage),
            FlowerImage: focusTime.flower.FlowerImg,
            FlowerName: focusTime.flower.name,
            member_id: focusTime.memberId,
            createdAt: focusTime.createdAt,
            createdAt: updatedFocusTime.createdAt,
            state: updatedFocusTime.state
        },
        include: {
            flower: updatedFocusTime.flower,
            member: updatedFocusTime.member
        }
    };
};


/**
 * 실시간 집중시간 정보 업데이트
 */
// const updateFocusTimeRealTime = async () => {
//     const focusTimes = await prisma.focusTime.findMany({
//         where: { state: 'IN_PROGRESS' },
//         include: { flower: true }
//     });
//     const updates = await Promise.all(
//         focusTimes.map(async (focusTime) => {
//             const elapsedTime = calculateElapsedTime(
//                 focusTime.createdAt,
//                 focusTime.targetTime
//             );
           
//             const newState = await updateState(
//                 focusTime,
//                 elapsedTime
//             );

//             // 현재 단계에 해당하는 꽃 이미지 URL 가져오기
//             const currentFlowerImage = await getUpdatedFlowerImage(
//                 elapsedTime,
//                 focusTime.targetTime,
//                 focusTime.flowerId
//             );

//             return {
//                 id: focusTime.id,
//                 target_time: convertSecondsToString(focusTime.targetTime),
//                 time: convertSecondsToString(focusTime.time),
//                 currentFlowerImage: currentFlowerImage, // 현재 단계 꽃 이미지 URL
//                 state: newState
//             };
//         })
//     );
//     // 업데이트된 데이터 반환
//     return (await Promise.all(updates)).filter((update) => update !== null);
// };

const broadcastNowFocusTime =  async (memberId) => {
  // focusTimeId에 해당하는 집중시간 객체 탐색
  const focusTime = await prisma.focusTime.findFirst({
    where: { 
      memberId: memberId,
      state: "IN_PROGRESS"  
    },
    include: {
      flower: true,
      member: true
    }
  });

  if(focusTime){ 
    // 서버와 클라이언트 시간 동기화를 위해 현재 서버 시간을 넘겨줌
    const now = Date.now();
    
    const time = Math.floor((now - focusTime.createdAt.getTime()) / 1000);

    let quarter; 

    // 몇번쨰 이미지 인지 체크
    if(focusTime.targetTime == 0){
      quarter =  Math.floor(time / parseInt(STOPWATCH,10)) 
    }else{
      quarter = Math.floor((time / focusTime.targetTime) * 4) + 1;
    }
    
    const data = {
      id: focusTime.id,
      category: focusTime.category,
      target_time: convertSecondsToString(focusTime.targetTime),
      time: convertSecondsToString(time),
      currentFlowerImage: getUpdatedFlowerImage(quarter, focusTime.flower.FlowerImg),
      FlowerImage: focusTime.flower.FlowerImg,
      FlowerName: focusTime.flower.name,
      member_id: focusTime.memberId,
      createdAt: focusTime.createdAt,
      now: now
    }
    sse.broadcast(memberId, data)
  }
  else{
    sse.broadcast(memberId, null)
  }
}

/**
 * 집중시간 종료
 */
const endFocusTimeById = async (memberId, focusTimeId) => {
    const parsedFocusTimeId = parseInt(focusTimeId, 10);

    // focusTimeId에 해당하는 집중시간 객체 탐색
    const focusTime = await prisma.focusTime.findUnique({
        where: { id: parsedFocusTimeId },
        include: {
          flower:true,
        },
    });

    if (!focusTime) {
        throw new CustomError(ErrorCodes.NotFound, "해당 집중시간 정보가 존재하지 않습니다.");
    }

    // 타이머 모드일 경우
    if (focusTime.state == 'IN_PROGRESS' && focusTime.targetTime != 0) {
        // 시든 이미지 가져오기
        const currentFlowerImage = getWitherImg();

        const canceledFocusTime = await prisma.focusTime.update({
            where: { id: parsedFocusTimeId },
            data: {
                state: 'WILTED',
                time: 0,    // 시간을 0으로 초기화
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
                target_time: convertSecondsToString(canceledFocusTime.targetTime),
                time: convertSecondsToString(canceledFocusTime.time),
                currentFlowerImage: currentFlowerImage,
                flower_id: canceledFocusTime.flowerId,
                member_id: canceledFocusTime.memberId,
                createdAt: canceledFocusTime.createdAt,
                state: canceledFocusTime.state
            },
            include: {
                flower: canceledFocusTime.flower,
                member: canceledFocusTime.member
            }
        }
    }else if (focusTime.state == 'IN_PROGRESS'){ // 스톱워치
      // 꽃 이미지 가져오기
      const currentFlowerImage = focusTime.flower.FlowerImg;

      const time = Math.floor((Date.now() - focusTime.createdAt) / 1000);

      const canceledFocusTime = await prisma.focusTime.update({
          where: { id: parsedFocusTimeId },
          data: {
              state: 'BLOOMED',
              time: time,    // 종료된 시간 저장
          },
          include: {
              flower: true,
              member: true
          }
      });

      //미션 업데이트 
      const completedFocusTimeMissions = await missionService.updateFocusTimeMission(memberId, canceledFocusTime.time);
      const completedFlowerMissions = await missionService.updateTotalFlowerMission(memberId);
  
      return {
          data: {
              id: canceledFocusTime.id,
              category: canceledFocusTime.category,
              target_time: convertSecondsToString(canceledFocusTime.targetTime),
              time: convertSecondsToString(canceledFocusTime.time),
              currentFlowerImage: currentFlowerImage,
              flower_id: canceledFocusTime.flowerId,
              member_id: canceledFocusTime.memberId,
              createdAt: canceledFocusTime.createdAt,
              state: canceledFocusTime.state
          },
          missions: {
            focusTimeMissions: completedFocusTimeMissions,
            flowerMissions: completedFlowerMissions,
          },
          include: {
              flower: canceledFocusTime.flower,
              member: canceledFocusTime.member
          }
      }
    }else{
      return null; // 이미 종료된 집중시간
    }
};

// 타이머 정상 종료
const completeFocusTimeById = async (memberId, focusTimeId) => {
  // focusTimeId에 해당하는 집중시간 객체 탐색
  const focusTime = await prisma.focusTime.findUnique({
    where: { id: focusTimeId },
  });

  if (!focusTime) {
    throw new NotFoundError("해당 집중시간 정보가 존재하지 않습니다.");
  }

  if (focusTime.state == 'IN_PROGRESS' && focusTime.targetTime != 0){
    const updatedFocusTime = await prisma.focusTime.update({
      where: { id: focusTimeId },
      data: { 
        state: 'BLOOMED',
        time: focusTime.targetTime 
      },
    });

    //미션 업데이트 
    const completedFocusTimeMissions = await missionService.updateFocusTimeMission(memberId, updatedFocusTime.time);
    const completedFlowerMissions = await missionService.updateTotalFlowerMission(memberId);
    
    return {
      data: updatedFocusTime,
      missions: {
        focusTimeMissions: completedFocusTimeMissions,
        flowerMissions: completedFlowerMissions,
      }
    };
  }else{
    return null;
  }
};

module.exports = {
    createFocusTime,
    updateFocusTimeCategoryById,
    completeFocusTimeById,
    endFocusTimeById,
    broadcastNowFocusTime
};
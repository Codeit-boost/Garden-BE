const asyncHandler = require('../utils/asyncHandler');
const { ErrorCodes, CustomError } = require('../utils/error');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getMissions = asyncHandler(async(req, res) => {
    const userId = req.user.id;

  try {
    const missions = await prisma.memberMission.findMany({
      where: { 
        memberId: Number(userId)
      },
      include: { 
        mission:{
          include: {
            flower: true
          }
        }
      },
      orderBy: { 
        mission: {
          id: 'desc'
        }
      },
    });

    res.json(missions);
  } catch (error) {
    throw new CustomError(
      ErrorCodes.InternalServerError, 
      '미션 목록 조회 중 오류가 발생했습니다.'
    );
  }
});


//연속 심기 미션 업데이트(매일 1번)
const updateConsecutivePlantingMission = asyncHandler(async(req, res) => {
  const memberId = req.user.id;

  try{
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const missions = await prisma.memberMission.findMany({
      where: {
        memberId,
        mission: { type: 'CONSECUTIVE_PLANTING' },
        NOT: { lastUpdated: { gte: new Date(today) } },
        completed: false
      },
      include: {mission: true},
    });

    for (const plantingMission of missions){
      let reset = false;

      //마지막 업데이트가 어제 이전이면 연속심기 초기화
      if(!plantingMission.lastUpdated || plantingMission.lastUpdated < yesterday ){
        reset = true;
      }
      if(reset || !plantingMission.startDate){
        //미션 초기화 또는 새로 시작
        await prisma.memberMission.update({
          where: {id :plantingMission.id},
          data: {
            startDate: today,
            completed: false,
            lastUpdated: today,
          },
        });
      }else{
        //연속심기 진행중
        const days = Math.floor((today.getTime() - plantingMission.startDate.getTime()) / (24 * 60 * 60 * 1000)); //연속 일자
        if(days >= plantingMission.mission.targetValue -1){
          await prisma.memberMission.update({
            where: {id: plantingMission.id},
            data: {
              completed: true,
              lastUpdated: today,
            },
          });
        }else{
          //연속 심기 진행 중이지만 아직 완료되지 않은 경우
          await prisma.memberMission.update({
            where: {id: plantingMission.id},
            data: {
              lastUpdated: today,       //lastUpdated만 업데이트
            }
          })
        }
      }
    }
    res.status(200).json({message: "연속 심기 미션이 업데이트 되었습니다."});   //확인용
  }catch(error){
    throw new CustomError(
      ErrorCodes.InternalServerError, 
      '연속심기 미션 업데이트 중 오류가 발생했습니다.'
    );
  }
});


//집중 시간 미션(집중 시간 저장 시)
const updateFocusTimeMission = asyncHandler(async(memberId, focusTime) => {
  const missions = await prisma.memberMission.findMany({
    where: {
      memberId,
      mission: { type: 'FOCUS_TIME'},
      completed: false
    },
    include: {mission: true},
  });

  for (const focusMission of missions){
    if(focusTime >= focusMission.mission.targetValue){
      await prisma.memberMission.update({
        where: {id: focusMission.id},
        data: {completed: true},
      });
    }
  }
});

// 심은 꽃 미션(새로운 꽃 심을 경우)



 module.exports = {
    getMissions,
    updateConsecutivePlantingMission,
    updateFocusTimeMission,
 };
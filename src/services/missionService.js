const { PrismaClient } = require('@prisma/client');
const { CustomError, ErrorCodes } = require('../utils/error');
const calculateTime = require('../utils/calculateTime');

const prisma = new PrismaClient();

const uncompletedMission = async (memberId) => {
    try {
      const missions = await prisma.memberMission.findMany({
        where: {
          memberId: Number(memberId),
        },
        include: {
          mission: {
            include: { flower: true },
          },
        },
        orderBy: {
          mission: { id: "asc" },
        },
      });
  
      const missionList = [];
  
      missions.forEach((mission) => {
        const formatMission = {
          title: mission.mission.title,
          description: mission.mission.description,
          type: mission.mission.type,
          targetValue: mission.mission.targetValue,
          currentValue: 0,
          completed: mission.completed,
          flowerName: mission.mission.flower.name,
        };
  
        missionList.push(formatMission);
      });
  
      return missionList;

    } catch (error) {
      throw new CustomError(ErrorCodes.InternalServerError,"사용자의 미션 목록 조회 중 오류가 발생하였습니다.");
    }
};
//연속 심기 미션 업데이트(로그인시..?)
const updateConsecutivePlantingMission = async(memberId) => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));      //시간 자정으로 맞춤
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  
    try{
        const missions = await prisma.memberMission.findMany({
            where: {
                memberId,
                mission: { type: 'CONSECUTIVE_PLANTING' },
                NOT: { lastUpdated: { gte: new Date(today) } },   //오늘 이미 갱신된 미션 제외
                completed: false,
            },
            include: {mission: { include: { flower: true } } },
        });

        const completedMissions = [];
    
        for (const plantingMission of missions){
            let reset = false;
    
            //날짜 계산 편하게 자정으로 다 맞춤
            const lastUpdated = plantingMission.lastUpdated? new Date(new Date(plantingMission.lastUpdated).setHours(0, 0, 0, 0)) : null;
            const startDate = plantingMission.startDate? new Date(new Date(plantingMission.startDate).setHours(0, 0, 0, 0)) : null;
    
            //마지막 업데이트가 어제 이전이면 연속심기 초기화
            if(!lastUpdated || lastUpdated < yesterday ){
            reset = true;
            }
            if(reset || !startDate){
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
            //연속심기 미션 완료한 경우
            const days = startDate?Math.floor((today - startDate) / (24 * 60 * 60 * 1000)): 0; //연속 일자
            if(days >= plantingMission.mission.targetValue -1){
                await prisma.memberMission.update({
                where: {id: plantingMission.id},
                data: {
                    completed: true,
                    lastUpdated: today,
                },
                });
                completedMissions.push({
                    missionId: plantingMission.id,
                    flower: plantingMission.mission.flower?
                    {
                        name: plantingMission.mission.flower.name, 
                        FlowerImg: plantingMission.mission.flower.FlowerImg
                    } : null      //해당 미션으로 깨지는 꽃이 없는 경우 'null'반환
                });
            }else{
                //연속 심기 진행 중이지만 아직 완료되지 않은 경우
                await prisma.memberMission.update({
                    where: {id: plantingMission.id},
                    data: {
                        lastUpdated: today,       //lastUpdated만 업데이트
                    },
                });
            }
            }
        }
        //console.log(completedMissions);     //점검용
        return completedMissions;       //완료한 미션 반환
    }catch(error){
        throw new CustomError(ErrorCodes.InternalServerError, '연속 미션 업데이트 중 오류가 발생하였습니다.');
    }
};
  

//집중 시간 미션(집중 시간 저장 시)
const updateFocusTimeMission = async(memberId, focusTime) => {
    const focusedTime = calculateTime.convertTimeToHours(focusTime);
    
    try{
        const missions = await prisma.memberMission.findMany({
        where: {
            memberId,
            mission: { type: 'FOCUS_TIME'},
            completed: false
        },
        include: {mission: { include: { flower: true } } },
        });
    
        const completedMissions = [];

        for (const focusMission of missions){
            if(focusedTime >= focusMission.mission.targetValue){
                await prisma.memberMission.update({
                    where: {id: focusMission.id},
                    data: {completed: true},
                });
                completedMissions.push({
                    missionId: focusMission.id,
                    flower: focusMission.mission.flower?
                    {
                        name: focusMission.mission.flower.name, 
                        FlowerImg: focusMission.mission.flower.FlowerImg
                    } : null
                });
            }
        }
        return completedMissions;
    }catch(error){
        throw new CustomError(ErrorCodes.InternalServerError, '집중시간 미션 업데이트 중 오류가 발생하였습니다.');
    }
};


// 심은 꽃 미션(새로운 꽃 심을 경우-집중 시간 저장 시)
const updateTotalFlowerMission = async(memberId) => {
    try{
        const uniqueFlowers = await prisma.focusTime.findMany({
            where: { memberId: memberId},
                select: { flowerId: true },
                distinct: ['flowerId'],
        });
        const cntUniqueFlowers = uniqueFlowers.length;  //심은 꽃 개수
    
        const flowerMissions = await prisma.memberMission.findMany({
        where: {
            memberId,
            mission: { type: 'TOTAL_FLOWERS'},
            completed: false,
        },
        include: {mission: { include: { flower: true } } },
        });

        const completedMissions = [];
    
        for (const flowerMission of flowerMissions){
            if(cntUniqueFlowers >= flowerMission.mission.targetValue){
                await prisma.memberMission.update({
                    where: { id: flowerMission.id },
                    data: { completed: true },
                });
                completedMissions.push({
                    missionId: flowerMission.id,
                    flower: flowerMission.mission.flower?
                    {
                        name: flowerMission.mission.flower.name, 
                        FlowerImg: flowerMission.mission.flower.FlowerImg
                    } : null
                });
            }
        }
        return completedMissions;
    }catch(error){
        throw new CustomError(ErrorCodes.InternalServerError, '심은 꽃 미션 업데이트 중 오류가 발생하였습니다.');
    }
};



//처음 가입한 사람의 경우 미션 초기 할당
const setupMission= async(memberId) => {
    try{
        const missions = await prisma.mission.findMany({
            select: {id: true}
        });

        if(missions.length === 0){
            throw new CustomError(ErrorCodes.NotFound, '할당할 미션이 없습니다.');
        }

        //새로운 멤버에게 모든 미션 자동 할당
        await prisma.memberMission.createMany({
            data: missions.map(mission=> ({
                memberId,
                missionId: mission.id,
                startDate: new Date(),
                lastUpdated: new Date()
            }))
        });

        console.log('미션 초기할당이 완료되었습니다');      //확인용
    }catch(error){
        console.error('미션 초기 생성 중 오류:', error);
        throw new CustomError(ErrorCodes.InternalServerError, '미션 초기 생성 중 오류가 발생하였습니다.');
    }
};


module.exports = {
    uncompletedMission,
    updateConsecutivePlantingMission,
    updateTotalFlowerMission,
    updateFocusTimeMission,
    setupMission,
}
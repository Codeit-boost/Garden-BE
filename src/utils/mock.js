const { PrismaClient, MissionType } = require("@prisma/client");
const prisma = new PrismaClient();

const missionService = require('../services/missionService');  
const flowerService = require('../services/flowerService');     
const categoryService = require('../services/categoryService');

// 미션 생성 함수
const generateMockMissions = async() => {

    const createdFlowers = await prisma.flower.findMany();

    const missions = [
        {title: '3일 연속 심기', description: '연속 3일 동안 꽃을 심었어요', type: MissionType.CONSECUTIVE_PLANTING, targetValue: 3, flowerId: createdFlowers[3].id},
        {title: '7일 연속 심기', description: '연속 7일 동안 꽃을 심었어요', type: MissionType.CONSECUTIVE_PLANTING, targetValue: 7, flowerId: createdFlowers[4].id},
        {title: '30일 연속 심기', description: '연속 30일 동안 꽃을 심었어요', type: MissionType.CONSECUTIVE_PLANTING, targetValue: 30, flowerId: createdFlowers[5].id},
        {title: '초급 가드너', description: '총 2개의 꽃을 심었어요', type: MissionType.TOTAL_FLOWERS, targetValue: 2, flowerId: createdFlowers[6].id},
        {title: '중급 가드너', description: '총 5개의 꽃을 심었어요', type: MissionType.TOTAL_FLOWERS, targetValue: 5, flowerId: createdFlowers[7].id},
        {title: '고급 가드너', description: '총 10개의 꽃을 심었어요', type: MissionType.TOTAL_FLOWERS, targetValue: 10, flowerId: createdFlowers[8].id},
        {title: '5시간 집중', description: '총 5시간 동안 집중했어요', type: MissionType.FOCUS_TIME, targetValue: 5, flowerId: createdFlowers[9].id},
        {title: '10시간 집중', description: '총 10시간 동안 집중했어요', type: MissionType.FOCUS_TIME, targetValue: 10, flowerId: createdFlowers[10].id},
        {title: '10시간 집중', description: '총 15시간 동안 집중했어요', type: MissionType.FOCUS_TIME, targetValue: 15, flowerId: createdFlowers[11].id},
    ];

    for (const mission of missions){
        await prisma.mission.create({data: mission});
    }
};

// 꽃 생성 함수
const generateMockFlowers = async() => {
    const flowers = [
        {name: '장미', language: '사랑, 열정', IMG: 'https://garden-c.kro.kr/images/1.png'},                 
        {name: '해바라기', language: '희망, 기다림, 숭배', IMG: 'https://garden-c.kro.kr/images/2.png'},         
        {name: '메리골드', language: '반드시 오고야 말 행복', IMG: 'https://garden-c.kro.kr/images/3.png'},      
        {name: '초롱꽃', language: '인도, 침묵', IMG: 'https://garden-c.kro.kr/images/4.png'},
        {name: '코스모스', language: '소녀의 순결, 순정', IMG: 'https://garden-c.kro.kr/images/5.png'},
        {name: '수선화', language: '자존심, 고결, 신비', IMG: 'https://garden-c.kro.kr/images/6.png'},
        {name: '물망초', language: '날 잊지 마세요, 진실한 사랑', IMG: 'https://garden-c.kro.kr/images/7.png'},
        {name: '능소화', language: '명예, 영광', IMG: 'https://garden-c.kro.kr/images/8.png'},
        {name: '제비꽃', language: '순진한 사랑', IMG: 'https://garden-c.kro.kr/images/9.png'},
        {name: '라벤더', language: '정절, 침묵', IMG: 'https://garden-c.kro.kr/images/10.png'},
        {name: '도라지꽃', language: '영원한 사랑', IMG: 'https://garden-c.kro.kr/images/11.png'},
        {name: '히아신스', language: '유희, 겸손한 사랑', IMG: 'https://garden-c.kro.kr/images/12.png'},
    ];

    for(const flower of flowers){
        await prisma.flower.create({
            data:{
                name: flower.name,
                language: flower.language,
                FlowerImg: flower.IMG
            },
        });
    }
};

const assignDefaultToMember = async () => {
    try {
      members = await prisma.member.findMany();

      members.forEach(member => {
        missionService.setupMission(member.id);
        flowerService.setupFlower(member.id);
        categoryService.setupCategory(member.id)
      });

    } catch (error) {
      console.error('기본 꽃 할당 중 에러 발생:', error);
      throw error;
    }
  };

const generateMockData = async() => {
    try{
        //기존 데이터 삭제
        await prisma.mission.deleteMany();
        console.log("Deleted all missions");

        await prisma.flower.deleteMany();
        console.log("Deleted all flowers");
        
        //flower 테이블 시퀀스 초기화
        await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Flower"', 'id'), 1, false);`;
        
        //새 데이터 생성
        await generateMockFlowers();            //꽃 먼저 생성
        await generateMockMissions();
        await assignDefaultToMember();

        console.log('Mock data generation completed successfully');
    }catch(error){
        console.log('Error generating mock data:', error);
    }finally{
        await prisma.$disconnect();
    }
};


// 더미 데이터 생성 실행
generateMockData();
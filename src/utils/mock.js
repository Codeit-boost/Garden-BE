const { PrismaClient, MissionType } = require("@prisma/client");

const prisma = new PrismaClient();

// 미션 생성 함수
const generateMockMissions = async() => {
    const missions = [
        {title: '3일 연속 심기', description: '연속 3일 동안 꽃을 심었어요', type: MissionType.CONSECUTIVE_PLANTING, targetValue: 3},
        {title: '초급 가드너', description: '총 2개의 꽃을 심었어요', type: MissionType.TOTAL_FLOWERS, targetValue: 2},
        {title: '5시간 집중', description: '총 5시간 동안 집중했어요', type: MissionType.FOCUS_TIME, targetValue: 5},
    ];

    for (const mission of missions){
        await prisma.mission.create({data: mission});
    }
};

// 꽃 생성 함수
const generateMockFlowers = async() => {
    const flowerTypes = ['장미', '해바라기', '메리골드', '초롱꽃', '코스모스', '수선화', '물망초', '능소화', '제비꽃','라벤더'];
    
    for(const flowerType of flowerTypes){
        await prisma.flower.create({
            data:{
                name: flowerType,
                bloomImg: '활짝핀꽃이미지URL'
            },
        });
    }
};

//유저 생성 함수


const generateMockData = async() => {
    try{
        //기존 데이터 삭제
        await prisma.mission.deleteMany();
        console.log("Deleted all missions");

        await prisma.flower.deleteMany();
        console.log("Deleted all flowers");

        //새 데이터 생성
        await generateMockMissions();
        await generateMockFlowers();

        console.log('Mock data generation completed successfully');
    }catch(error){
        console.log('Error generating mock data:', error);
    }finally{
        await prisma.$disconnect();
    }
};


// 더미 데이터 생성 실행
generateMockData();
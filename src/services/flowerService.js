const { PrismaClient } = require('@prisma/client');
const { CustomError, ErrorCodes } = require('../utils/error');

const prisma = new PrismaClient();


const findUnlockedFlowers = async(memberId) => {
    try{
        // 모든 꽃
        const memberFlowers = await prisma.memberFlower.findMany({
            where: { memberId: Number(memberId) },
            include: {
                flower: {
                    select: {
                        id: true,
                        name: true,
                        FlowerImg: true,
                    },
                },
            },
        });
    
        // 필요한 부분만
        const result = memberFlowers.map((mf) => ({
            id: mf.flower.id,
            name: mf.flower.name,
            FlowerImg: mf.flower.FlowerImg,
            unlocked: mf.unlocked,
        }));
    
        // unlocked가 true인 항목이 먼저 나오고, 동일할 경우 id 오름차순으로 정렬합니다.
        result.sort((a, b) => {
            if (a.unlocked === b.unlocked) {
                return a.id - b.id;
            }
            return a.unlocked ? -1 : 1;
        });

        return result

    }catch(error){
        throw new CustomError(ErrorCodes.InternalServerError, '잠금 해제된 꽃 목록 조회 중 오류가 발생했습니다.');
    }
};


//처음 가입한 사람의 경우 꽃 초기 할당
const setupFlower = async(memberId) => {
    try{
        const flowers = await prisma.flower.findMany({
            select: {id: true}
        });
        if(flowers.length === 0){
            throw new CustomError(ErrorCodes.NotFound, '할당할 꽃이 없습니다.');
        }
        
        //새로운 멤버에게 모든 꽃 자동 할당
        await prisma.memberFlower.createMany({
            data: flowers.map(flower=> ({
                memberId,
                flowerId: flower.id,
            }))
        });

        //처음 3개의 꽃은 unlock(장미, 메리골드, 해바라기)
        await prisma.memberFlower.updateMany({
            where: {
                memberId,
                flowerId: { in: [1, 2] }
            },
            data: { unlocked: true },
        });
        console.log('꽃 초기할당이 완료되었습니다');          //확인용
    }catch(error){
        console.error(error);
        throw new CustomError(ErrorCodes.InternalServerError, '꽃 초기 생성 중 오류가 발생하였습니다.')
    }
};

module.exports = {
    findUnlockedFlowers,
    setupFlower,
};
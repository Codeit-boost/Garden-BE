const { PrismaClient } = require('@prisma/client');
const { CustomError, ErrorCodes } = require('../utils/error');

const prisma = new PrismaClient();


const findUnlockedFlowers = async(memberId) => {
    try{
        const unlockedFlowers = await prisma.memberFlower.findMany({
            where: {
                memberId: Number(memberId),
                unlocked: true
            },
            include:{
                flower: true
            }
        });

        return unlockedFlowers;
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

        //처음 1개의 꽃은 unlock
        const firstFlower = await prisma.memberFlower.findFirst({
            where: { memberId, flowerId: 1}             //1번째 꽃 id가 무조건 1이여야됨
        });

        if(firstFlower){
            await prisma.memberFlower.updateMany({
                where: { memberId, flowerId: 1},
                data: {unlocked: true},
            });
        }
        console.log('꽃 초기할당이 완료되었습니다');          //확인용
    }catch(error){
        console.error(error);
        throw new CustomError(ErrorCodes.InternalServerError, '꽃 초기 생성 중 오류가 발생하였습니다.')
    }
}

module.exports = {
    findUnlockedFlowers,
    setupFlower,
}
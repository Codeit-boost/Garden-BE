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
}

module.exports = {
    findUnlockedFlowers,
}
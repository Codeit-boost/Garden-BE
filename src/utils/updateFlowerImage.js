const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
/**
 * 누적 시간이 목표 시간의 4분의 1 이상일 때마다 꽃 이미지 ID 업데이트
 */
const updateFlowerId = async (elapsedTime, targetTime, flowerId) => {

    // 타이머 모드
    if (targetTime) {
        const quarter = targetTime / 4;
        
        // 0: growthImg1, 1: growthImg2, 2: growthImg3
        const flowerIndex = Math.min(Math.floor(elapsedTime / quarter), 3);

        // 꽃 이미지 가져오기
        const flower = await prisma.flower.findUnique({
            where: { id: flowerId }
        });

        // flower 객체에서 각 이미지를 불러온 후, 적절한 이미지를 반환
        if (flower) {
            const flowerImages = [
                flower.growthImg1, 
                flower.growthImg2, 
                flower.growthImg3, 
                flower.bloomImg
            ];

            // 목표 시간에 다 도달하면 bloomImg로 설정
            if (elapsedTime >= targetTime) {
                return flower.bloomImg;
            }

            // 목표 시간에 도달하지 못하면 누적 시간에 따라 꽃 이미지 변경
            return flowerImages[flowerIndex];
        }
        return null;
    }

    // 스톱워치 모드
    else {
        const quarter = 180 / 4;

        // 0: growthImg1, 1: growthImg2, 2: growthImg3
        const flowerIndex = Math.min(Math.floor(elapsedTime / quarter), 3);

        // 꽃 이미지 가져오기
        const flower = await prisma.flower.findUnique({
            where: { id: flowerId }
        });

        // flower 객체에서 각 이미지를 불러온 후, 적절한 이미지를 반환
        if (flower) {
            const flowerImages = [
                flower.growthImg1, 
                flower.growthImg2, 
                flower.growthImg3, 
                flower.bloomImg
            ];

            // 목표 시간에 다 도달하면 bloomImg로 설정
            if (elapsedTime >= 180) {
                return flower.bloomImg;
            }
            // 목표 시간에 도달하지 못하면 누적 시간에 따라 꽃 이미지 변경
            return flowerImages[flowerIndex];
        }
        return null;
    }
};


module.exports = {
    updateFlowerId
};
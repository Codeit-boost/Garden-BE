/**
 * 누적 집중시간 계산 함수
 * 현재 시간과 생성 시간의 차이를 계산해서 3시간 초과 시, 3시간으로 제한
 * 분 단위로 소수점 둘째 자리까지만 계산해서 반환
 */
const calculateElapsedTime = (createdAt, targetTime) => {
    const currentTime = new Date();  // 현재 시간
    const createdAtDate = new Date(createdAt);  // 집중시간 생성 시간

    // 누적 집중시간
    const elapsedTime = Math.min((currentTime - createdAtDate) / (1000 * 60), 180); // 분 단위로 변경

    if (targetTime != null && elapsedTime > targetTime) {
        return Math.floor(targetTime * 100) / 100;
    }
    
    return Math.floor(elapsedTime * 100) / 100;
};


module.exports = {
    calculateElapsedTime
};
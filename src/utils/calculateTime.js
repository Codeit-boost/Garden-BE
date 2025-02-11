/**
 * 누적 집중시간 계산 함수
 * 현재 시간과 생성 시간의 차이를 계산해서 3시간 초과 시, 3시간으로 제한
 * 분 단위로 소수점 둘째 자리까지만 계산해서 반환
 */
const calculateElapsedTime = (createdAt, targetTime) => {
    const currentTime = new Date();  // 현재 시간
    const createdAtDate = new Date(createdAt);  // 집중시간 생성 시간

    // 누적 집중시간 (1ms -> 1s로 변환)
    const elapsedTime = Math.min((currentTime - createdAtDate) / 1000, 10800); // 초 단위로 변경

    if (targetTime != null && elapsedTime > targetTime) {
        return targetTime;
    }
    
    return Math.floor(elapsedTime);
};

/**
 * 시간을 초 단위에서 HH:MM:SS 형태로 변환하는 함수
 */
const convertSecondsToString = (time) => {
    const totalSeconds = Math.floor(time);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * 시간을 초 단위에서 HH:MM 형태로 변환하는 함수
 */
const convertSecondsToHHMM = (time) => {
    const totalSeconds = Math.floor(time);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * 시간을 HH:MM:SS 형태에서 초 단위로 변환하는 함수
 */
const convertStringToSeconds = (time) => {
    if (time === "00:00:00")  // 스톱워치 모드
        return 0;
    
    const [hours, minutes, seconds] = time.split(":").map(Number);

    // 총 초 단위 계산
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    return totalSeconds;
};

/**
 * 전체 시간에서 시간만 반환하는 함수
 */
const convertTimeToHours = (time) => {
    const hours = Math.floor(time / 3600);
    return hours;
};

module.exports = {
    calculateElapsedTime,
    convertSecondsToString,
    convertSecondsToHHMM,
    convertStringToSeconds,
    convertTimeToHours
};
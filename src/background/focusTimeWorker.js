const redis = require('redis');
const prisma = require("../middlewares/prismaMiddleware");
const focusTimeService = require("../services/focusTimeService.js");
const sse = require("../sse/sse.js");
const { convertStringToSeconds, convertSecondsToString } = require("../utils/calculateTime.js");
const { getUpdatedFlowerImage } = require("../utils/updateFlowerImage.js");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.connect().catch(console.error);

const SCHEDULE_KEY = 'focusTime:timers';

// 집중 시간 생성시 레디스에 저장
const scheduleFocusTimeEvent = async (memberId, data, quarter) => {
  if(convertStringToSeconds(data.target_time) == 0) { // 스탑워치
    const quarterInterval = 300;
    const eventTimestamp =  Math.floor(new Date(data.createdAt) / 1000) + quarterInterval * quarter; // quarterInterval 후에 실행
    
    const eventData = {memberId, data, quarter};
    await redisClient.zAdd(SCHEDULE_KEY, [{
      score: eventTimestamp,
      value: JSON.stringify(eventData)
    }]);
  }else{ // 타이머
    const quarterInterval = convertStringToSeconds(data.target_time) / 4;
    const eventTimestamp = Math.floor(new Date(data.createdAt) / 1000) + quarterInterval * quarter; // quarterInterval 후에 실행
    const eventData = {memberId, data, quarter};

    await redisClient.zAdd(SCHEDULE_KEY, [{
      score: eventTimestamp,
      value: JSON.stringify(eventData)
    }]);
  }
}

const removeEventsByMemberId = async (memberId) => {
  try {
    // SCHEDULE_KEY의 모든 이벤트 가져오기
    const events = await redisClient.zRange(SCHEDULE_KEY, 0, -1);

    // 삭제할 이벤트를 찾기
    const eventsToRemove = events
      .map((eventStr) => JSON.parse(eventStr)) // JSON 문자열 → 객체 변환
      .filter((event) => event.memberId === memberId) // memberId 일치 여부 확인
      .map((event) => JSON.stringify(event)); // 다시 JSON 문자열로 변환 (ZREM에서 문자열 매칭 필요)

    if (eventsToRemove.length === 0) {
      console.log(`삭제할 이벤트 x. (memberId: ${memberId})`);
      return;
    }

    // ZREM을 사용하여 이벤트 삭제
    await redisClient.zRem(SCHEDULE_KEY, ...eventsToRemove);
    console.log(`memberId(${memberId})에 해당하는 이벤트 삭제`);
  } catch (error) {
    console.error("삭제 실패:", error);
    throw error;
  }
};

// 1초마다 레디스의 시간 기준으로 로직 실행
setInterval(async () => {
  try {
    const now = Math.floor(Date.now() / 1000);
    // score가 now 이하인 이벤트들을 가져옴
    const events = await redisClient.zRangeByScore(SCHEDULE_KEY, 0, now);
    for (const eventStr of events) {
      const event = JSON.parse(eventStr);
      // 이벤트 제거
      await redisClient.zRem(SCHEDULE_KEY, eventStr);

      //sse에 클라이언트가 있다면
      if(sse.isClientConnected(event.memberId)){
        // 타이머
        if(convertStringToSeconds(event.data.target_time) != 0){
          if (event.quarter < 4) { // 4번째 이전 일시
            console.log(`⌛ FocusTime ${event.data.id}: Quarter ${event.quarter} reached`);
            
            const data = event.data;
            data.currentFlowerImage = getUpdatedFlowerImage(event.quarter + 1, data.FlowerImage);
            data.now = Date.now();
    
            data.time = convertSecondsToString(Math.floor((Date.now() - new Date(data.createdAt).getTime()) / 1000))

            data.message = `집중 시간 ${event.quarter}/4 경과`
            sse.broadcast(event.memberId, data)
           // 다음 분기 이벤트 등록 (예: 2/4, 3/4 순으로)
            await scheduleFocusTimeEvent(event.memberId, data, event.quarter + 1);
          }else{ // 4번째 일 때
            const data = event.data;
            data.now = Date.now();
            data.time = data.target_time;
            data.message = "집중 시간 완료"
            sse.broadcast(event.memberId, data)
            focusTimeService.completeFocusTimeById(event.data.id);
          }
        }else{// 스톱워치
          console.log(`⌛ FocusTime ${event.data.id}: Quarter ${event.quarter} reached`);
            
          const data = event.data;
          data.currentFlowerImage = getUpdatedFlowerImage(data.quarter + 1, data.FlowerImage);
          data.now = Date.now();
  
          data.time = convertSecondsToString(Math.floor((Date.now() - new Date(data.createdAt).getTime())/1000))

          data.message = `집중 시간 ${event.quarter * 25}분 경과`
          sse.broadcast(event.memberId, data)
         // 다음 분기 이벤트 등록 (예: 2/4, 3/4 순으로), 타이머와 달리 무한으로 진행
          await scheduleFocusTimeEvent(event.memberId, data, event.quarter + 1);
        }
      }else{ // sse에 클라이언트가 없다면 종료 또는 취소
        focusTimeService.endFocusTimeById(event.data.id);
      }
    }
  } catch (error) {
    console.error("❌ Error processing focus time events:", error);
  }
}, 1000); // 1초마다


module.exports = {
  scheduleFocusTimeEvent,
  removeEventsByMemberId,
};
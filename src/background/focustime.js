const redis = require('redis');
const prisma = require("../middlewares/prismaMiddleware");
const focusTimeService = require("../services/focusTimeService.js");
const sse = require("../sse/sse.js");
const { convertStringToSeconds } = require("../utils/calculateTime.js");
const { getUpdatedFlowerImage } = require("../utils/updateFlowerImage.js");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.connect().catch(console.error);

const SCHEDULE_KEY = 'focusTime:timers';

// 집중 시간 생성시 레디스에 저장
const scheduleFocusTimeEvent = async (memberId, data, quarter) => {
  console.log(data)
  if(convertStringToSeconds(data.target_time) == 0) {
    const quarterInterval = 25;
    const eventTimestamp =  Math.floor(new Date(data.createdAt) / 1000) + quarterInterval * quarter; // quarterInterval 후에 실행
    const eventData = {memberId, data, quarter};
    await redisClient.zAdd(SCHEDULE_KEY, [{
      score: eventTimestamp,
      value: JSON.stringify(eventData)
    }]);
  }else{
    const quarterInterval = convertStringToSeconds(data.target_time) / 4;
    const eventTimestamp = Math.floor(new Date(data.createdAt) / 1000) + quarterInterval * quarter; // quarterInterval 후에 실행
    const eventData = {memberId, data, quarter};

    console.log(eventTimestamp);

    await redisClient.zAdd(SCHEDULE_KEY, [{
      score: eventTimestamp,
      value: JSON.stringify(eventData)
    }]);
  }
}

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

      if (event.quarter < 4) {
        console.log(`⌛ FocusTime ${event.data.id}: Quarter ${event.quarter} reached`);
        
        const data = event.data;
        data.currentFlowerImage = getUpdatedFlowerImage(data.quarter + 1, data.FlowerImage);
        data.now = Date.now();

        //sse에 클라이언트가 있다면
        if(sse.isClientConnected(event.memberId)){
          sse.broadcast(event.memberId, data)
           // 다음 분기 이벤트 등록 (예: 2/4, 3/4 순으로)
          await scheduleFocusTimeEvent(event.memberId, data, event.quarter + 1);
        }else{ //sse에 클라이언트가 없으면
          // 디비 로직은 await 하지 않음 -> 실행은 되지만 실행을 기다리지 않고 반복문 실행
          focusTimeService.cancelFocusTimeById(event.data.id);
        }        
       
      } else {
        console.log(`⌛ FocusTime ${event.data.id}: Full time reached. Updating DB...`);
      
        // 디비 로직은 await 하지 않음 -> 실행은 되지만 실행을 기다리지 않고 반복문 실행
        focusTimeService.completeFocusTimeById(event.data.id);
      }
    }
  } catch (error) {
    console.error("❌ Error processing focus time events:", error);
  }
}, 1000); // 1초마다


module.exports = {
  scheduleFocusTimeEvent
};
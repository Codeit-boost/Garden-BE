const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

(async () => {
  try {
    await redisClient.connect();
    console.log("Redis 연결 성공");
  } catch (error) {
    console.error("Redis 연결 실패:", error);
  }
})();

module.exports = redisClient;

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const api = require("./routers/index");
const setupSwagger = require('./config/swagger');
const { errorMiddleware } = require("./middlewares/errorMiddleware");

// const http = require('http');
// const { startWebSocketServer } = require('./services/webSocketServer.js');
const focusTimeRouter = require('./routers/focusTimeRouters.js');

const app = express();
// const server = http.createServer(app);

// 미들웨어 설정
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// 라우트 연결
app.use("/api", api);

// Swagger 설정
setupSwagger(app);

// 에러 핸들러 등록
app.use(errorMiddleware);

// 웹소켓 서버 시작
// startWebSocketServer(server);

// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => {
//     console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
// });

module.exports = app;
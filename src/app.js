const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const api = require("./routers/index");
const setupSwagger = require('./config/swagger');
const { errorMiddleware } = require("./middlewares/errorMiddleware");
require("./middlewares/prismaMiddleware");

const app = express();

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

// Prisma 클라이언트 연결 종료 처리
process.on('SIGINT', async () => {
    const prisma = require('./middlewares/prismaMiddleware');
    await prisma.$disconnect();
    console.log('🛑 Prisma 클라이언트 연결 종료');
    process.exit(0);
});

module.exports = app;
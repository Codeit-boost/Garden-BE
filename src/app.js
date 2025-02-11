require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const api = require("./routers/index");
const setupSwagger = require('./config/swagger');
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const cookieParser = require("cookie-parser");
require("./middlewares/prismaMiddleware");

const app = express();

// 미들웨어 설정
app.use(morgan('dev'));
app.use(cors({
    credentials: true, // 쿠키 전송 허용
}));

app.use(express.json());
app.use(cookieParser());

// 라우트 연결
app.use("/api", api);

// Swagger 설정
setupSwagger(app);

// 에러 핸들러 등록
app.use(errorMiddleware);

module.exports = app;
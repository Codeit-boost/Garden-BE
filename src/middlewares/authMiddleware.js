const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { ErrorCodes, CustomError } = require("../utils/error");
const asyncHandler = require('../utils/asyncHandler.js');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  // Authorization 헤더에서 토큰 가져오기
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // httpOnly 쿠키에서 토큰 가져오기 (헤더가 없을 경우)
  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  // 토큰이 없는 경우 에러 반환
  if (!token) {
    throw new CustomError(ErrorCodes.Unauthorized, 'Unauthorized: 토큰이 없습니다.');
  }

  let decoded;

  //JWT 토큰 검증
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      throw new CustomError(ErrorCodes.Unauthorized, "Unauthorized: 토큰이 만료되었습니다.");
    }
    throw new CustomError(ErrorCodes.Unauthorized, "Unauthorized: 유효하지 않은 토큰입니다.");
  }

  // 사용자 정보를 req.user에 추가
  req.user = {
    id: decoded.id,
    name: decoded.name
  };

  // 이 미들웨어를 거친 후 req.user == 로그인한 유저 정보  
  // req.user.id
  next();
});

const authMiddlewareWithSetting = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Authorization 헤더 검증
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError(ErrorCodes.Unauthorized, 'Unauthorized: Authorization 헤더가 없습니다.');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new CustomError(ErrorCodes.Unauthorized, 'Unauthorized: 토큰이 없습니다.');
  }

  let decoded;

  //JWT 토큰 검증
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      throw new CustomError(ErrorCodes.Unauthorized, "Unauthorized: 토큰이 만료되었습니다.");
    }
    throw new CustomError(ErrorCodes.Unauthorized, "Unauthorized: 유효하지 않은 토큰입니다.");
  }

  // 사용자 조회
  const member = await prisma.member.findUnique({
    where: { id: decoded.id },
  });

  if (!member) {
    throw new CustomError(ErrorCodes.NotFound, "User not found: 해당 사용자가 존재하지 않습니다.");
  }

  // 사용자 정보를 req.user에 추가
  req.user = {
    id: member.id,
    name: member.name,
    alarm: member.alarm,
    mode: member.mode,
    sound: member.sound,
  };

  // 이 미들웨어를 거친 후 req.user == 로그인한 유저 정보  
  // req.user.id
  next();
});

module.exports = authMiddleware;
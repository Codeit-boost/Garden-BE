const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { ErrorCodes, CustomError } = require('../utils/error');
const asyncHandler = require('../utils/asyncHandler');

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const prisma = new PrismaClient();

// 카카오 로그인 URL 리다이렉트
const kakaoLoginURL = (req, res) => {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;
  console.log(kakaoAuthURL)
  res.redirect(kakaoAuthURL);
};

// 카카오 콜백 처리
const kakaoCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    throw new CustomError(ErrorCodes.BadRequest, 'Authorization code is required');
  }

  // 액세스 토큰 요청
  const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    throw new CustomError(ErrorCodes.BadRequest, 'Failed to fetch access token');
  }

  const tokenData = await tokenResponse.json();
  const { access_token } = tokenData;

  // 사용자 정보 요청
  const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userResponse.ok) {
    throw new CustomError(ErrorCodes.NotFound, 'Failed to fetch user info');
  }

  const userData = await userResponse.json();
  const kakaoUserId = String(userData.id);

  console.log('Kakao User Data:', userData);

  // 데이터베이스에서 사용자 확인 또는 생성
  let member = await prisma.member.findUnique({ where: { kakaoUserId } });

  if (!member) {
    member = await prisma.member.create({
      data: {
        name: userData.properties.nickname,
        kakaoUserId,
      },
    });
  }

  // JWT 생성
  const token = jwt.sign(
    { id: member.id, nickname: member.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 클라이언트에 JWT 반환
  res.status(200).json({ message: 'Login successful', token, user: member });
});

// 로그아웃
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

// 인증된 사용자 정보 가져오기
const getAuthenticatedUser = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = {
  kakaoLoginURL,
  kakaoCallback,
  logout,
  getAuthenticatedUser,
};
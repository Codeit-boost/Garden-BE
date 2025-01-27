const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { ErrorCodes, CustomError } = require('../utils/error');

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const prisma = new PrismaClient();

const getKakaoAuthURL = () => {
  return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;
};

const fetchAccessToken = async (code) => {
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

  return tokenResponse.json();
};

const fetchUserInfo = async (accessToken) => {
  const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userResponse.ok) {
    throw new CustomError(ErrorCodes.NotFound, 'Failed to fetch user info');
  }

  return userResponse.json();
};

const findOrCreateMember = async (kakaoUserId, nickname) => {
  let member = await prisma.member.findUnique({ where: { kakaoUserId } });

  if (!member) {
    member = await prisma.member.create({
      data: {
        name: nickname,
        kakaoUserId,
      },
    });
  }

  return member;
};

const generateJWT = (member) => {
  return jwt.sign(
    { id: member.id, name: member.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

module.exports = {
  getKakaoAuthURL,
  fetchAccessToken,
  fetchUserInfo,
  findOrCreateMember,
  generateJWT,
};
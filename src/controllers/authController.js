const asyncHandler = require('../utils/asyncHandler');
const kakaoAuthService = require('../services/kakaoAuthService');

// 카카오 로그인 URL 리다이렉트
const kakaoLoginURL = (req, res) => {
  const kakaoAuthURL = kakaoAuthService.getKakaoAuthURL();
  console.log(kakaoAuthURL);
  res.redirect(kakaoAuthURL);
};

// 카카오 콜백 처리
const kakaoCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    throw new CustomError(ErrorCodes.BadRequest, 'Authorization code is required');
  }

  // 1. 액세스 토큰 요청
  const { access_token } = await kakaoAuthService.fetchAccessToken(code);

  // 2. 사용자 정보 요청
  const userData = await kakaoAuthService.fetchUserInfo(access_token);
  const kakaoUserId = String(userData.id);
  const nickname = userData.properties.nickname;
  const profileImage = userData.properties.profile_image;
  const email = userData.kakao_account.email;

  //console.log('Kakao User Data:', userData);

  // 3. 사용자 데이터베이스 저장 또는 확인
  const member = await kakaoAuthService.findOrCreateMember(
    kakaoUserId,
    nickname,
    profileImage,
    email
  );

  // 4. JWT 생성 및 반환
  const token = kakaoAuthService.generateJWT(member);
  
  res.status(200).json({ message: 'Login successful', token, user: member });
};

// 로그아웃
const logout = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// 인증된 사용자 정보 가져오기
const getAuthenticatedUser = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = {
  kakaoLoginURL,
  kakaoCallback,
  logout,
  getAuthenticatedUser,
};
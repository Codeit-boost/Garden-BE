const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require("../middlewares/authMiddleware")

const router = express.Router();

/**
 * @swagger
 * /api/auth/kakao:
 *   get:
 *     summary: 카카오 로그인 URL 리다이렉트
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 카카오 로그인 페이지로 리다이렉트
 */
router.get('/kakao', authController.kakaoLoginURL);

/**
 * @swagger
 * /api/auth/kakao/callback:
 *   get:
 *     summary: 카카오 로그인 콜백 처리
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: 카카오에서 반환한 인증 코드
 *     responses:
 *       200:
 *         description: 로그인 성공 시 JWT와 사용자 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: your-jwt-token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *       500:
 *         description: 로그인 실패
 */
router.get('/kakao/callback', authController.kakaoCallback);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그아웃 성공 메시지 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 인증된 사용자 정보 가져오기
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 인증된 사용자 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     kakaoUserId:
 *                       type: string
 *                     alarm:
 *                       type: boolean
 *                     mode:
 *                       type: string
 *                     sound:
 *                       type: string
 *       401:
 *         description: 인증 실패 (토큰 없음 또는 유효하지 않음)
 */
router.get('/me', authMiddleware, authController.getAuthenticatedUser);

module.exports = router;
const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const memberControllers = require('../controllers/memberControllers');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: 모든 멤버를 집중시간 총합 순으로 페이지네이션 조회
 *     tags: [Members]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 멤버 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('', asyncHandler(memberControllers.getMembers));

module.exports = router;
/**
 * @swagger
 * /api/members/me:
 *   get:
 *     summary: 회원 상세 정보 조회
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 alarm:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: 회원 정보 없음
 *       401:
 *         description: 인증 실패
 */
router.get('/me', authMiddleware, asyncHandler(memberControllers.getMyInfo));

/**
 * @swagger
 * /api/members/me:
 *   put:
 *     summary: 회원 정보 수정 
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               alarm:
 *                 type: boolean
 *                 example: true
 *               mode:
 *                 type: string
 *                 example: dark
 *               sound:
 *                 type: string
 *                 example: on
 *     responses:
 *       200:
 *         description: 수정된 회원 정보 반환
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.put('/me', authMiddleware, asyncHandler(memberControllers.updateMyInfo));

/**
 * @swagger
 * /api/members/me:
 *   delete:
 *     summary: 회원 삭제
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: 회원 삭제 성공
 *       401:
 *         description: 인증 실패
 */
router.delete('/me', authMiddleware, asyncHandler(memberControllers.deleteMyAccount));

/**
 * @swagger
 * /api/members/friend:
 *   post:
 *     summary: 친구 추가 요청
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: 친구 요청 성공
 *       400:
 *         description: 이미 요청됨 또는 친구 상태
 *       401:
 *         description: 인증 실패
 */
router.post('/friend', authMiddleware, asyncHandler(memberControllers.makeFriend));

/**
 * @swagger
 * /api/members/friend:
 *   delete:
 *     summary: 친구 삭제
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       204:
 *         description: 친구 삭제 성공
 *       401:
 *         description: 인증 실패
 */
router.delete('/friend', authMiddleware, asyncHandler(memberControllers.removeFriend));

module.exports = router;
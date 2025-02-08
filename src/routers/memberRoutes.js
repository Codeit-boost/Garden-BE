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
 *         description: "페이지 번호 (기본값: 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "페이지당 항목 수 (기본값: 10)"
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
 *                   description: "현재 페이지 번호"
 *                 limit:
 *                   type: integer
 *                   description: "페이지당 항목 수"
 *                 members:
 *                   type: array
 *                   description: "멤버 목록"
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: "멤버 ID"
 *                       name:
 *                         type: string
 *                         description: "멤버 이름"
 *                       totalFocusTime:
 *                         type: integer
 *                         description: "총 집중 시간 (단위: 초)"
 *                       wiltedCount:
 *                         type: integer
 *                         description: "시든 꽃 개수"
 *                       bloomedCount:
 *                         type: integer
 *                         description: "핀 꽃 개수"
 */
router.get('', asyncHandler(memberControllers.getMembers));

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
 *                 kakaoUserId:
 *                   type: string
 *                   example: "3892295605"
 *                 name:
 *                   type: string
 *                   example: "이승찬"
 *                 alarm:
 *                   type: boolean
 *                   example: false
 *                 mode:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 sound:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 friendsMember:
 *                   type: array
 *                   description: 사용자가 친구 추가한 목록
 *                   items:
 *                     type: object
 *                     properties: {}
 *                   example: []
 *                 friendsFriend:
 *                   type: array
 *                   description: 사용자를 친구 추가한 목록
 *                   items:
 *                     type: object
 *                     properties:
 *                       memberId:
 *                         type: integer
 *                         example: 2
 *                       friendId:
 *                         type: integer
 *                         example: 1
 *                 flowers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties: {}
 *                   example: []
 *                 Missions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties: {}
 *                   example: []
 *                 wiltedCount:
 *                   type: integer
 *                   description: 시든 꽃 개수
 *                   example: 5
 *                 bloomedCount:
 *                   type: integer
 *                   description: 핀 꽃 개수
 *                   example: 11
 *                 currentTotalTime:
 *                   type: integer
 *                   description: 현재 회원의 총 집중 시간 (초 단위)
 *                   example: 1692
 *                 nextTotalTime:
 *                   type: integer
 *                   nullable: true
 *                   description: 현재 회원보다 높은 집중시간을 가진 다음 회원의 총 시간 차이 (없으면 null)
 *                   example: null
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
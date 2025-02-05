const express = require("express");
const router = express.Router();

const asyncHandler = require('../utils/asyncHandler');
const { getMissions } = require('../controllers/missionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/list', authMiddleware, asyncHandler(getMissions));


/**
 * @swagger
 * /api/mission/list:
 *   get:
 *     summary: "사용자 미션 목록 조회"
 *     description: "로그인한 사용자의 모든 미션 목록을 조회합니다."
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "성공적으로 미션 목록 조회"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: "미션 고유 ID"
 *                   description:
 *                     type: string
 *                     description: "미션 설명"
 *                   memberId:
 *                     type: integer
 *                     description: "회원 ID"
 *                   flowerId:
 *                     type: integer
 *                     description: "꽃 ID"
 *                   member:
 *                     type: object
 *                     description: "회원 정보"
 *                   flower:
 *                     type: object
 *                     description: "꽃 정보"
 *       401:
 *         description: "인증 실패"
 *       500:
 *         description: "서버 오류"
 */

module.exports = router;
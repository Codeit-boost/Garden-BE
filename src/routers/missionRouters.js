const express = require("express");
const router = express.Router();

const asyncHandler = require('../utils/asyncHandler');
const { getMissions } = require('../controllers/missionController');
const authMiddleware = require('../middlewares/authMiddleware');

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
 *                   title:
 *                     type: string
 *                     description: "미션 제목"
 *                   description:
 *                     type: string
 *                     description: "미션 설명"
 *                   type:
 *                     type: string
 *                     description: "미션 유형"
 *                   targetValue:
 *                     type: integer
 *                     description: "목표 값"
 *                   currentValue:
 *                     type: integer
 *                     description: "현재 진행 값"
 *                   completed:
 *                     type: boolean
 *                     description: "미션 완료 여부"
 *                   flowerName:
 *                     type: string
 *                     description: "연관된 꽃 이름"
 *       401:
 *         description: "인증 실패"
 *       500:
 *         description: "서버 오류"
 */
router.get('/list', authMiddleware, asyncHandler(getMissions));

module.exports = router;
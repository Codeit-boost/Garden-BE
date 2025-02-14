const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();
const { getTodayFlower, getUnlockedFlowers } = require("../controllers/flowerController");
const authMiddleware = require('../middlewares/authMiddleware');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));


//오늘의 꽃 & 꽃말
// GET /api/flower/todayFlower
router.get('/todayFlower', asyncHandler(getTodayFlower));

/**
 * @swagger
 * /api/flower/todayFlower:
 *   get:
 *     summary: "오늘의 꽃 정보 조회"
 *     tags: [Flower]
 *     parameters:
 *       - in: query
 *         name: fMonth
 *         schema:
 *           type: string
 *           default: "{현재 월}"
 *         description: "조회할 월 (MM), 기본값은 현재 월"
 *       - in: query
 *         name: fDay
 *         schema:
 *           type: string
 *           default: "{현재 일}"
 *         description: "조회할 일 (DD), 기본값은 현재 일"
 *     responses:
 *       200:
 *         description: "성공적으로 꽃 정보를 반환합니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "장미"
 *                 language:
 *                   type: string
 *                   example: "사랑"
 *       500:
 *         description: "서버 오류가 발생했습니다."
 */


//사용자가 잠금 해제한 꽃
router.get('/unlocked', authMiddleware, asyncHandler(getUnlockedFlowers));

/**
 * @swagger
 * /api/flower/unlocked:
 *   get:
 *     summary: "사용자의 미션 목록 조회"
 *     description: "로그인한 사용자가 보유한 미션 목록을 반환합니다."
 *     tags: [Flowers]
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
 *                     example: "3일 연속 심기"
 *                   description:
 *                     type: string
 *                     description: "미션 설명"
 *                     example: "연속 3일 동안 꽃을 심었어요"
 *                   type:
 *                     type: string
 *                     description: "미션 타입"
 *                     enum: [CONSECUTIVE_PLANTING, TOTAL_FLOWERS, FOCUS_TIME]
 *                     example: "CONSECUTIVE_PLANTING"
 *                   targetValue:
 *                     type: integer
 *                     description: "미션 목표값"
 *                     example: 3
 *                   currentValue:
 *                     type: integer
 *                     description: "현재 진행 값"
 *                     example: 2
 *                   completed:
 *                     type: boolean
 *                     description: "미션 달성 여부"
 *                     example: false
 *                   flowerName:
 *                     type: string
 *                     description: "관련 꽃 이름"
 *                     example: "초롱꽃"
 *       401:
 *         description: "인증 실패"
 *       500:
 *         description: "서버 오류"
 */

module.exports = router;
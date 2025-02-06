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
 *     summary: "사용자의 잠금 해제된 꽃 목록 조회"
 *     description: "로그인한 사용자가 잠금 해제한 꽃들의 목록을 반환합니다."
 *     tags: [Flowers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "성공적으로 잠금 해제된 꽃 목록 조회"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   memberId:
 *                     type: integer
 *                     description: "회원 ID"
 *                   flowerId:
 *                     type: integer
 *                     description: "꽃 ID"
 *                   unlocked:
 *                     type: boolean
 *                     description: "잠금 해제 여부"
 *                   flower:
 *                     type: object
 *                     description: "꽃 상세 정보"
 *       401:
 *         description: "인증 실패"
 *       500:
 *         description: "서버 오류"
 */

module.exports = router;
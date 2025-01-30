const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();
const { getTodayFlower, searchFlower, getUnlockedFlowers } = require("../controllers/flowerController");

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
 *         description: "조회할 월 (MM), 기본값은 현재 월"
 *       - in: query
 *         name: fDay
 *         schema:
 *           type: string
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


//이름으로 꽃 찾기 -- 나의 정원에 있는 꽃말 때문에 혹시 몰라서 만들어 놓음
// GET /api/flower/searchFlower
router.get('/search-flower', asyncHandler(searchFlower));

/**`
 * @swagger
 * /api/flower/search-flower:
 *   get:
 *     summary: "꽃 이름으로 검색"
 *     tags: [Flower]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: "검색할 꽃 이름"
 *     responses:
 *       200:
 *         description: "성공적으로 꽃 정보를 반환합니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "해바라기"
 *                   language:
 *                     type: string
 *                     example: "동경, 숭배"
 *       400:
 *         description: "꽃 이름을 입력해주세요."
 *       404:
 *         description: "검색 결과가 없습니다."
 *       500:
 *         description: "서버 오류가 발생했습니다."
 */


//사용자가 잠금 해제한 꽃
router.get('/unlocked', asyncHandler(getUnlockedFlowers));

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
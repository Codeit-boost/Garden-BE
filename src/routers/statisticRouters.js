const express = require("express");
const statisticController = require("../controllers/statisticController");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();

router.get("/statistic", asyncHandler(statisticController.getStatistic));
/**
 * @swagger
 * /api/statistic:
 *   get:
 *     tags: [Statistic]
 *     summary: 통계 조회
 *     description: 일/주/월 단위로 사용자의 집중시간 통계를 조회합니다.
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: 통계 조회 단위
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 연도
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: 조회할 월 (1-12)
 *       - in: query
 *         name: day
 *         schema:
 *           type: integer
 *         description: 조회할 일 (1-31)
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         description: 조회할 주차 (1-5)
 *     responses:
 *       200:
 *         description: 성공적으로 통계를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timeDistribution:
 *                   type: object
 *                   description: 시간대별 집중시간 분포
 *                 categoryAnalysis:
 *                   type: array
 *                   description: 카테고리별 분석
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       percentage:
 *                         type: number
 *                       time:
 *                         type: number
 *                       count:
 *                         type: number
 *                 flowerAnalysis:
 *                   type: array
 *                   description: 꽃별 분석
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       floriography:
 *                         type: string
 *                       totalCount:
 *                         type: number
 *                       bloomedCount:
 *                         type: number
 *                       wiltedCount:
 *                         type: number
 *                 period:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 잘못된 요청 데이터입니다.
 *       401:
 *         description: 인증되지 않은 사용자입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

module.exports = router;
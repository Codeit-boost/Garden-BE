const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const focusTimeController = require("../controllers/focusTimeController");
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/focusTime:
 *   post:
 *     tags: [FocusTime]
 *     security:
 *       - bearerAuth: []
 *     summary: 집중시간 생성
 *     description: 목표 시간, 꽃, 카테고리 선택을 통해 새로운 집중시간을 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFocusTime'
 *     responses:
 *       201:
 *         description: 집중시간이 성공적으로 생성되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FocusTime'
 *       400:
 *         description: 잘못된 입력 데이터입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
router.post("", authMiddleware, asyncHandler(focusTimeController.createFocusTime));

/**
 * @swagger
 * /api/focusTime/stream:
 *   get:
 *     tags: [FocusTime]
 *     summary: 집중시간 실시간 업데이트 스트림
 *     description: |
 *       클라이언트는 이 엔드포인트에 연결하여 실시간 집중시간 업데이트를 받을 수 있습니다.
 *       서버는 집중시간의 상태가 변경될 때 SSE(Server-Sent Events) 형식으로 데이터를 푸시합니다.
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - text/event-stream
 *     responses:
 *       200:
 *         description: SSE 연결이 성공적으로 설정되었습니다.
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: 'data: {"id":7,"category":"공부","target_time":"00:00:40","time":"00:00:00","currentFlowerImage":"","FlowerImage":null,"FlowerName":"장미","member_id":1,"createdAt":"2025-02-06T06:52:35.195Z","now":1738824755957}'
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
router.get("/stream",authMiddleware,  asyncHandler(focusTimeController.focusTimeSSE));


// /**
//  * @swagger
//  * /api/focusTime/{focusTimeId}:
//  *   get:
//  *     tags: [FocusTime]
//  *     security:
//  *       - bearerAuth: []
//  *     summary: 집중시간 세부 조회
//  *     description: 4분할 시간마다 집중시간의 세부 정보를 조회합니다.
//  *     parameters:
//  *       - in: path
//  *         name: focusTimeId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: 조회할 집중시간의 ID
//  *     responses:
//  *       200:
//  *         description: 성공적으로 집중시간 세부 정보를 조회했습니다.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/FocusTime'
//  *       404:
//  *         description: 해당 집중시간 정보가 존재하지 않습니다.
//  *       500:
//  *         description: 서버 오류가 발생했습니다.
//  */
// router.get("/:focusTimeId",authMiddleware, asyncHandler(focusTimeController.focusTimeDetail));


// /**
//  * @swagger
//  * /api/focusTime/update:
//  *   patch:
//  *     tags: [FocusTime]
//  *     security:
//  *       - bearerAuth: []
//  *     summary: 집중시간 정보 업데이트
//  *     description: 진행 중인 모든 집중시간 정보를 업데이트합니다. 집중시간이 목표 시간의 특정 비율에 도달하면 꽃 이미지를 변경하고, 누적 집중시간을 갱신합니다.
//  *     responses:
//  *       200:
//  *         description: 성공적으로 집중시간 정보가 업데이트되었습니다.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: 집중시간이 업데이트되었습니다.
//  *                 updates:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *       400:
//  *         description: 잘못된 요청 데이터입니다.
//  *       404:
//  *         description: 해당 집중시간 정보가 존재하지 않습니다.
//  *       500:
//  *         description: 서버 오류가 발생했습니다.
//  */
// router.patch("/update", authMiddleware, asyncHandler(focusTimeController.updateFocusTimeRealTime));


/**
 * @swagger
 * /api/focusTime/{focusTimeId}/cancel:
 *   patch:
 *     tags: [FocusTime]
 *     security:
 *       - bearerAuth: []
 *     summary: 타이머 모드 집중시간 포기
 *     description: 타이머 모드에서 집중시간을 포기하고 상태를 "WILTED"로 변경합니다.
 *     parameters:
 *       - in: path
 *         name: focusTimeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 포기할 집중시간의 ID
 *     responses:
 *       200:
 *         description: 성공적으로 집중시간이 포기되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: 포기된 집중시간 정보
 *       404:
 *         description: 해당 집중시간 정보가 존재하지 않습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
router.patch("/:focusTimeId/cancel", authMiddleware, asyncHandler(focusTimeController.cancelFocusTime));


/**
 * @swagger
 * /api/focusTime/{focusTimeId}:
 *   patch:
 *     tags: [FocusTime]
 *     security:
 *       - bearerAuth: []
 *     summary: 집중시간 카테고리 수정
 *     description: 기존 집중시간의 카테고리 정보를 수정합니다.
 *     parameters:
 *       - in: path
 *         name: focusTimeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 집중시간의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFocusTimeCategory'
 *     responses:
 *       200:
 *         description: 성공적으로 집중시간 카테고리 정보가 수정되었습니다.
 *       400:
 *         description: 잘못된 입력 데이터입니다.
 *       404:
 *         description: 해당 집중시간 정보가 존재하지 않습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
router.patch("/:focusTimeId", authMiddleware, asyncHandler(focusTimeController.updateFocusTimeCategory));


module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateFocusTime:
 *       type: object
 *       required:
 *         - target_time
 *         - flower_id
 *         - category
 *       properties:
 *         target_time:
 *           type: string
 *           description: 목표 시간 (ISO 8601 형식 혹은 "HH:mm:ss" 형식)
 *           example: "01:30:00"
 *         flower_id:
 *           type: integer
 *           description: 선택한 꽃 ID
 *           example: 3
 *         category:
 *           type: string
 *           description: 집중시간의 카테고리
 *           example: "공부"
 *
 *     FocusTime:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 집중시간 ID
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: 집중시간을 생성한 사용자 ID
 *           example: 42
 *         target_time:
 *           type: string
 *           description: 목표 시간
 *           example: "00:00:40"
 *         flower_id:
 *           type: integer
 *           description: 선택한 꽃 ID
 *           example: 1
 *         category:
 *           type: string
 *           description: 집중시간의 카테고리
 *           example: "공부"
 *         status:
 *           type: string
 *           description: 현재 집중시간의 상태
 *           example: "IN_PROGRESS"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 집중시간 생성 시간
 *           example: "2025-01-31T12:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 집중시간 최근 업데이트 시간
 *           example: "2025-01-31T12:30:00Z"
 *
 *     UpdateFocusTimeCategory:
 *       type: object
 *       required:
 *         - category
 *       properties:
 *         category:
 *           type: string
 *           description: 수정할 카테고리
 *           example: "운동"
 */
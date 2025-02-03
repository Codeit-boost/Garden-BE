const express = require("express");
const focusTimeController = require("../controllers/focusTimeController");
const router = express.Router();

/**
 * @swagger
 * /api/focusTime:
 *   post:
 *     tags: [FocusTime]
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
router.post("", focusTimeController.createFocusTime);


router.get("/stream", focusTimeController.focusTimeSSE);


/**
 * @swagger
 * /api/focusTime/{focusTimeId}:
 *   get:
 *     tags: [FocusTime]
 *     summary: 집중시간 세부 조회
 *     description: 4분할 시간마다 집중시간의 세부 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: focusTimeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 집중시간의 ID
 *     responses:
 *       200:
 *         description: 성공적으로 집중시간 세부 정보를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FocusTime'
 *       404:
 *         description: 해당 집중시간 정보가 존재하지 않습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
router.get("/:focusTimeId", focusTimeController.focusTimeDetail);


/**
 * @swagger
 * /api/focusTime/update:
 *   patch:
 *     tags: [FocusTime]
 *     summary: 집중시간 정보 업데이트
 *     description: 진행 중인 모든 집중시간 정보를 업데이트합니다. 집중시간이 목표 시간의 특정 비율에 도달하면 꽃 이미지를 변경하고, 누적 집중시간을 갱신합니다.
 *     responses:
 *       200:
 *         description: 성공적으로 집중시간 정보가 업데이트되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 집중시간이 업데이트되었습니다.
 *                 updates:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: 잘못된 요청 데이터입니다.
 *       404:
 *         description: 해당 집중시간 정보가 존재하지 않습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
router.patch("/update", focusTimeController.updateFocusTimeRealTime);


/**
 * @swagger
 * /api/focusTime/{focusTimeId}/cancel:
 *   patch:
 *     tags: [FocusTime]
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
router.patch("/:focusTimeId/cancel", focusTimeController.cancelFocusTime);


/**
 * @swagger
 * /api/focusTime/{focusTimeId}:
 *   patch:
 *     tags: [FocusTime]
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
router.patch("/:focusTimeId", focusTimeController.updateFocusTimeCategory);


module.exports = router;
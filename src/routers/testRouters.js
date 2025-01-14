const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { ErrorCodes, CustomError } = require("../middlewares/errorHandler");
const router = express.Router();

// 실제 등록시
// router.[method]("[path]", asyncHandler([controller.function]))
// api에 맞게 메소드, 경로 , 핸들러에 감싸서 컨트롤러의 함수 받으면 됩니다
// 에러 throw시 커스텀 에러 생성해서 던지면 에러 핸들러가 처리

// 테스트 api : hi
router.get(
  "/hi",
  asyncHandler((req, res) => {
    res.send("Hello");
  }),
);
/**
 * @swagger
 * /api/hi:
 *   get:
 *     summary: "안녕하세요 메시지 반환"
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: "성공적으로 메시지를 반환합니다."
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Hello"
 */

// 테스트 api : error
router.get(
  "/testErr",
  asyncHandler((req, res) => {
    throw new CustomError(ErrorCodes.BadRequest);
  }),
);
/**
 * @swagger
 * /api/testErr:
 *   get:
 *     summary: "테스트 오류 발생"
 *     tags: [Test]
 *     responses:
 *       400:
 *         description: "잘못된 요청입니다."
 */

module.exports = router;
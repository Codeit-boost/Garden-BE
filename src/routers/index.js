const express = require("express");
const router = express.Router();
const testRouters = require("./testRouters");
const authRouters = require("./authRoutes");
const memberRouters = require("./memberRoutes");
const focusTimeRouters = require('./focusTimeRouters.js');

/**
 * @swagger
 * tags:
 *   name: Test
 *   description: 테스트 API 관련 엔드포인트
 */
router.use("", testRouters);
router.use("", focusTimeRouters);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 관련 API
 */
router.use("/auth", authRouters);

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: 회원 관리 API
 */
router.use("/members", memberRouters);

module.exports = router;


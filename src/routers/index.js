const express = require("express");
const router = express.Router();
const testRouters = require("./testRouters");
const flowerRouters = require("./flowerRouters");
const missionRouters = require("./missionRouters");
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

/**
 * @swagger
 * tags:
 *   name: Flowers
 *   description: 꽃 관련 API
 */
router.use("/flower", flowerRouters);

/**
 * @swagger
 * tags:
 *   name: Missions
 *   description: 미션 관련 API
 */
router.use("/mission", missionRouters);

/**
 * @swagger
 * tags:
 *   name: FocusTime
 *   description: 집중시간 관련 API
 */
router.use("/focusTime", focusTimeRouters);


module.exports = router;

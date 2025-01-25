const express = require("express");
const router = express.Router();
const testRouters = require("./testRouters");
const flowerRouters = require("./flowerRouters");
const missionRouters = require("./missionRouters");

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

module.exports = router;
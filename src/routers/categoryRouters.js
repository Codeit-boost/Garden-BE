const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: "사용자의 카테고리 목록 조회"
 *     description: "로그인한 사용자가 만든 카테고리들의 목록을 반환합니다."
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "성공적으로 카테고리 목록 조회"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: "카테고리 이름"
 *       401:
 *         description: "인증 실패"
 *       500:
 *         description: "서버 오류"
 */
//카테고리 목록 조회
router.get('/', authMiddleware, asyncHandler(categoryController.getCategories));

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: "새로운 카테고리 생성"
 *     description: "사용자가 새 카테고리를 생성합니다."
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: "새로 생성할 카테고리 이름"
 *                 example: "헬스"
 *     responses:
 *       201:
 *         description: "카테고리 생성 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: "생성된 카테고리 이름"
 *       400:
 *         description: "잘못된 요청"
 *       401:
 *         description: "인증 실패"
 *       500:
 *         description: "서버 오류"
 */
//카테고리 생성
router.post('/', authMiddleware, asyncHandler(categoryController.createCategory));

/**
 * @swagger
 * /api/categories/update:
 *   put:
 *     summary: "카테고리 이름 수정"
 *     description: "기존 카테고리의 이름을 새 이름으로 수정합니다."
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldName:
 *                 type: string
 *                 description: "수정할 기존 카테고리 이름"
 *                 example: "운동"
 *               newName:
 *                 type: string
 *                 description: "새로운 카테고리 이름"
 *                 example: "헬스"
 *     responses:
 *       200:
 *         description: "카테고리 이름 수정 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 oldName:
 *                   type: string
 *                   description: "수정 전 카테고리 이름"
 *                 newName:
 *                   type: string
 *                   description: "수정된 카테고리 이름"
 *       400:
 *         description: "잘못된 요청"
 *       404:
 *         description: "카테고리 찾을 수 없음"
 *       409:
 *         description: "중복된 카테고리 이름"
 *       401:
 *         description: "인증 실패"
 *       500:
 *         description: "서버 오류"
 */
//카테고리 수정
router.put('/update', authMiddleware, asyncHandler(categoryController.updateCategory));

/**
 * @swagger
 * /api/categories:
 *   delete:
 *     summary: "카테고리 삭제"
 *     description: "사용자가 카테고리를 삭제합니다."
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryName
 *         required: true
 *         schema:
 *           type: string
 *         description: "삭제할 카테고리 이름"
 *         example: "헬스"
 *     responses:
 *       200:
 *         description: "카테고리 삭제 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: "성공 메시지"
 *                   example: "카테고리 삭제 성공"
 *       400:
 *         description: "잘못된 요청"
 *       404:
 *         description: "카테고리 찾을 수 없음"
 *       401:
 *         description: "인증 실패"
 *       500:
 *         description: "서버 오류"
 */
//카테고리 삭제
router.delete('/', authMiddleware, asyncHandler(categoryController.deleteCategory));

module.exports = router;
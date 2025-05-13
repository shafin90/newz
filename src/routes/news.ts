import { Router } from 'express';
import { getAllNews, createNews, updateNews, deleteNews } from '../controllers/newsController';
import auth from '../middlewares/auth';
import { validateNews } from '../middlewares/validation';
import handleValidation from '../middlewares/validationResult';

const router = Router();

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Get all news
 *     tags: [News]
 *     responses:
 *       200:
 *         description: List of news
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/News'
 */
router.get('/', getAllNews);

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create news
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewsInput'
 *     responses:
 *       201:
 *         description: News created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post('/', auth, validateNews, handleValidation, createNews);

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Update news
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: News ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewsInput'
 *     responses:
 *       200:
 *         description: News updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News not found
 *       422:
 *         description: Validation error
 */
router.put('/:id', auth, validateNews, handleValidation, updateNews);

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Delete news
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: News ID
 *     responses:
 *       200:
 *         description: News deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News not found
 */
router.delete('/:id', auth, deleteNews);

export default router; 
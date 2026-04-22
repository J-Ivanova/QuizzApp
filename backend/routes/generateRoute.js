import express from 'express';
import { generateQuestions } from '../services/aiService.js';

const router = express.Router();

router.post('/', generateQuestions);

export default router;
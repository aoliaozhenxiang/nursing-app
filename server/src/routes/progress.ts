import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { userDB, progressDB, wrongQuestionDB, favoriteDB, achievementDB } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nursing-app-secret-key-2024';

// 中间件：验证token
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: '无效的token' });
  }
}

// 获取用户学习统计
router.get('/stats', authenticate, (req: any, res: any) => {
  try {
    const stats = progressDB.getStats(req.userId);
    res.json(stats);
  } catch (error) {
    console.error('获取统计错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取学习进度列表
router.get('/', authenticate, (req: any, res: any) => {
  try {
    const { module } = req.query;
    const progressList = progressDB.getByUserId(req.userId, module as string);
    res.json({ progress: progressList });
  } catch (error) {
    console.error('获取进度错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新学习进度
router.post('/', authenticate, (req: any, res: any) => {
  try {
    const { module, item_id, item_type, status, score } = req.body;
    
    const progress = progressDB.update(req.userId, module, item_id, item_type, status, score);
    res.json({ success: true, progress });
  } catch (error) {
    console.error('更新进度错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取错题列表
router.get('/wrong-questions', authenticate, (req: any, res: any) => {
  try {
    const wrongQuestions = wrongQuestionDB.getByUserId(req.userId);
    res.json({ wrong_questions: wrongQuestions });
  } catch (error) {
    console.error('获取错题错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 添加错题
router.post('/wrong-questions', authenticate, (req: any, res: any) => {
  try {
    const { question_id, question_text, your_answer, correct_answer, module } = req.body;
    
    const wrongQuestion = wrongQuestionDB.add(req.userId, question_id, question_text, your_answer, correct_answer, module);
    res.json({ success: true, wrong_question: wrongQuestion });
  } catch (error) {
    console.error('添加错题错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取收藏列表
router.get('/favorites', authenticate, (req: any, res: any) => {
  try {
    const favorites = favoriteDB.getByUserId(req.userId);
    res.json({ favorites });
  } catch (error) {
    console.error('获取收藏错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 添加收藏
router.post('/favorites', authenticate, (req: any, res: any) => {
  try {
    const { item_id, item_type, title } = req.body;
    
    const favorite = favoriteDB.add(req.userId, item_id, item_type, title);
    res.json({ success: true, favorite });
  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除收藏
router.delete('/favorites/:id', authenticate, (req: any, res: any) => {
  try {
    const { id } = req.params;
    favoriteDB.remove(req.userId, parseInt(id));
    res.json({ success: true });
  } catch (error) {
    console.error('删除收藏错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取成就列表
router.get('/achievements', authenticate, (req: any, res: any) => {
  try {
    const achievements = achievementDB.getByUserId(req.userId);
    res.json({ achievements });
  } catch (error) {
    console.error('获取成就错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 解锁成就
router.post('/achievements', authenticate, (req: any, res: any) => {
  try {
    const { achievement_id, title, description } = req.body;
    
    const achievement = achievementDB.unlock(req.userId, achievement_id, title, description);
    res.json({ success: true, achievement });
  } catch (error) {
    console.error('解锁成就错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

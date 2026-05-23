import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import { users, progressDB, wrongDB, favoriteDB, achievementDB } from './db.js';
import jwt from 'jsonwebtoken';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'nursing-app-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行中' });
});

// Auth routes
app.use('/api/v1/auth', authRoutes);

// AI 对话和分析路由
app.use('/api/v1/ai', aiRoutes);

// 中间件：验证登录
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: '请先登录' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: '登录已过期' });
  }
}

// ============ 学习进度 API ============

// 记录学习进度
app.post('/api/v1/progress', authenticate, async (req, res) => {
  try {
    const { module, itemId, itemType, score } = req.body;
    const userId = req.userId;

    if (!module || !itemId) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const progress = await progressDB.upsert(userId, module, itemId, itemType || 'default', score || 0, 'completed');

    // 检查成就
    const stats = await progressDB.getStats(userId);

    if (stats.totalQuestions === 1) {
      await achievementDB.unlock(userId, 'first_step', '初学者', '完成第一个学习任务');
    }
    if (stats.totalQuestions === 10) {
      await achievementDB.unlock(userId, 'active_learner', '活跃学习者', '完成10个学习任务');
    }
    if (stats.totalQuestions === 50) {
      await achievementDB.unlock(userId, 'expert', '学习专家', '完成50个学习任务');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('记录进度错误:', error);
    res.status(500).json({ error: '记录失败' });
  }
});

// 获取学习进度
app.get('/api/v1/progress', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const progress = await progressDB.getByUser(userId);
    const stats = await progressDB.getStats(userId);
    res.json({ success: true, progress, ...stats });
  } catch (error) {
    console.error('获取进度错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// 获取用户统计
app.get('/api/v1/progress/stats', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const stats = await progressDB.getStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('获取统计错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// ============ 错题本 API ============

// 添加错题
app.post('/api/v1/wrong-questions', authenticate, async (req, res) => {
  try {
    const { questionId, questionText, yourAnswer, correctAnswer, module } = req.body;
    const userId = req.userId;

    const wrongQuestion = await wrongDB.add(userId, questionId, questionText, yourAnswer, correctAnswer, module);
    res.json({ success: true, wrongQuestion });
  } catch (error) {
    console.error('添加错题错误:', error);
    res.status(500).json({ error: '添加失败' });
  }
});

// 获取错题
app.get('/api/v1/wrong-questions', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const wrongQuestions = await wrongDB.getByUser(userId);
    res.json({ success: true, wrongQuestions });
  } catch (error) {
    console.error('获取错题错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// 删除错题（答对后）
app.delete('/api/v1/wrong-questions/:questionId', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { questionId } = req.params;
    await wrongDB.remove(userId, questionId);
    res.json({ success: true });
  } catch (error) {
    console.error('删除错题错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// ============ 收藏 API ============

// 添加收藏
app.post('/api/v1/favorites', authenticate, async (req, res) => {
  try {
    const { itemId, itemType, title } = req.body;
    const userId = req.userId;

    const favorite = await favoriteDb.add(userId, itemId, itemType, title);
    if (!favorite) {
      return res.json({ success: true, message: '已收藏' });
    }
    res.json({ success: true, favorite });
  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({ error: '添加失败' });
  }
});

// 获取收藏
app.get('/api/v1/favorites', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const favorites = await favoriteDb.getByUser(userId);
    res.json({ success: true, favorites });
  } catch (error) {
    console.error('获取收藏错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// 取消收藏
app.delete('/api/v1/favorites/:itemId/:itemType', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, itemType } = req.params;
    await favoriteDb.remove(userId, itemId, itemType);
    res.json({ success: true });
  } catch (error) {
    console.error('取消收藏错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// ============ 成就 API ============

// 获取成就
app.get('/api/v1/achievements', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const achievements = await achievementDb.getByUser(userId);
    res.json({ success: true, achievements });
  } catch (error) {
    console.error('获取成就错误:', error);
    res.status(500).json({ error: '获取失败' });
  }
});

// Start server
const PORT = process.env.PORT || 9091;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});

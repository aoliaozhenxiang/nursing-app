import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cihang_nursing_secret_key_2024';

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    // 检查用户是否已存在
    const existUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (existUser.rows.length > 0) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const result = await pool.query(
      'INSERT INTO users (username, password, nickname) VALUES ($1, $2, $3) RETURNING id, username, nickname, created_at',
      [username, hashedPassword, nickname || username]
    );
    
    res.status(201).json({
      message: '注册成功',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    // 查找用户
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const user = result.rows[0];
    
    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 生成token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户信息
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未登录' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, username, nickname, avatar, created_at FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(401).json({ error: 'token无效' });
  }
});

// 更新学习进度
router.post('/progress', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: '未登录' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { chapterId, chapterName, progress, videoWatched, practiceCompleted, examScore } = req.body;
    
    // 插入或更新进度
    await pool.query(`
      INSERT INTO learning_progress (user_id, chapter_id, chapter_name, progress, video_watched, practice_completed, exam_score, last_studied_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, chapter_id) 
      DO UPDATE SET 
        progress = GREATEST(learning_progress.progress, $4),
        video_watched = learning_progress.video_watched OR $5,
        practice_completed = learning_progress.practice_completed OR $6,
        exam_score = GREATEST(learning_progress.exam_score, $7),
        last_studied_at = CURRENT_TIMESTAMP
    `, [decoded.id, chapterId, chapterName, progress || 0, videoWatched || false, practiceCompleted || false, examScore || 0]);
    
    res.json({ message: '进度已保存' });
  } catch (error) {
    console.error('保存进度错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取学习进度
router.get('/progress', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: '未登录' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const result = await pool.query(
      'SELECT * FROM learning_progress WHERE user_id = $1 ORDER BY last_studied_at DESC',
      [decoded.id]
    );
    
    res.json({ progress: result.rows });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 添加错题
router.post('/wrong-question', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: '未登录' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { questionId, questionContent, yourAnswer, correctAnswer } = req.body;
    
    // 检查是否已存在
    const exist = await pool.query(
      'SELECT id, wrong_count FROM wrong_questions WHERE user_id = $1 AND question_id = $2',
      [decoded.id, questionId]
    );
    
    if (exist.rows.length > 0) {
      await pool.query(
        'UPDATE wrong_questions SET wrong_count = wrong_count + 1, your_answer = $1 WHERE id = $2',
        [yourAnswer, exist.rows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO wrong_questions (user_id, question_id, question_content, your_answer, correct_answer) VALUES ($1, $2, $3, $4, $5)',
        [decoded.id, questionId, questionContent, yourAnswer, correctAnswer]
      );
    }
    
    res.json({ message: '已加入错题本' });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取错题
router.get('/wrong-questions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: '未登录' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const result = await pool.query(
      'SELECT * FROM wrong_questions WHERE user_id = $1 AND mastered = FALSE ORDER BY created_at DESC',
      [decoded.id]
    );
    
    res.json({ wrongQuestions: result.rows });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取成就
router.get('/achievements', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: '未登录' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const result = await pool.query(
      'SELECT * FROM achievements WHERE user_id = $1 ORDER BY earned_at DESC',
      [decoded.id]
    );
    
    res.json({ achievements: result.rows });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

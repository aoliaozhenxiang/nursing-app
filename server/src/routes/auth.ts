import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByUsername, createUser, getProgress, getWrongQuestions, getFavorites, getAchievements } from '../db.js';

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
    const existUser = findUserByUsername(username);
    if (existUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const newUser = {
      id: Date.now(),
      username,
      password: hashedPassword,
      nickname: nickname || username,
      created_at: new Date().toISOString()
    };
    
    createUser(newUser);
    
    res.status(201).json({
      message: '注册成功',
      user: { id: newUser.id, username: newUser.username, nickname: newUser.nickname }
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
    const user = findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
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
      user: { id: user.id, username: user.username, nickname: user.nickname }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未登录' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = findUserByUsername(decoded.username);
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    // 获取用户数据
    const progress = getProgress(user.id);
    const wrongQuestions = getWrongQuestions(user.id);
    const favorites = getFavorites(user.id);
    const achievements = getAchievements(user.id);
    
    res.json({
      user: { id: user.id, username: user.username, nickname: user.nickname },
      stats: {
        progressCount: progress.length,
        wrongCount: wrongQuestions.length,
        favoriteCount: favorites.length,
        achievementCount: achievements.length
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(401).json({ error: 'token无效' });
  }
});

export default router;

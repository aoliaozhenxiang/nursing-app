import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { userDb } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nursing-app-secret-key-2024';

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: '用户名至少3个字符' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6个字符' });
    }

    // 检查用户名是否已存在
    const existingUser = await userDb.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 创建用户（密码直接存储，生产环境应该加密）
    const user = await userDb.create(username, password, nickname);

    // 生成token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '注册成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }

    // 查找用户
    const user = await userDb.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码（简单对比，生产环境应该加密验证）
    if (user.password !== password) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: '未登录' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const user = await userDb.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(401).json({ error: '登录已过期' });
  }
});

// 更新用户信息
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: '未登录' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const { nickname } = req.body;

    await query(
      'UPDATE users SET nickname = COALESCE($1, nickname) WHERE id = $2',
      [nickname, decoded.id]
    );

    const user = await userDb.findById(decoded.id);

    res.json({
      success: true,
      message: '更新成功',
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      }
    });

  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

export default router;

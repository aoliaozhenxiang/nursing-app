import { Pool } from 'pg';

// PostgreSQL 连接配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 测试连接
pool.on('connect', () => {
  console.log('✅ PostgreSQL 数据库连接成功');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 连接错误:', err);
});

// 通用查询函数
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('查询执行时间:', duration + 'ms', { rows: res.rowCount });
  return res;
}

// 用户相关
export const userDb = {
  // 创建用户
  async create(username: string, password: string, nickname?: string) {
    const result = await query(
      'INSERT INTO users (username, password, nickname) VALUES ($1, $2, $3) RETURNING *',
      [username, password, nickname || username]
    );
    return result.rows[0];
  },

  // 根据用户名查找
  async findByUsername(username: string) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  },

  // 根据ID查找
  async findById(id: number) {
    const result = await query(
      'SELECT id, username, nickname, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },
};

// 学习进度相关
export const progressDb = {
  // 记录进度
  async record(userId: number, module: string, itemId: string, itemType: string, score: number) {
    const result = await query(
      `INSERT INTO progress (user_id, module, item_id, item_type, score, status, completed_at)
       VALUES ($1, $2, $3, $4, $5, 'completed', CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, module, item_id)
       DO UPDATE SET score = $5, status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, module, itemId, itemType, score]
    );
    return result.rows[0];
  },

  // 获取用户进度
  async getByUser(userId: number) {
    const result = await query(
      'SELECT * FROM progress WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    return result.rows;
  },

  // 获取模块统计
  async getStats(userId: number) {
    const result = await query(
      `SELECT module, COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM progress WHERE user_id = $1 GROUP BY module`,
      [userId]
    );
    return result.rows;
  },
};

// 错题本相关
export const wrongQuestionDb = {
  // 添加错题
  async add(userId: number, questionId: string, questionText: string, yourAnswer: string, correctAnswer: string, module: string) {
    const result = await query(
      `INSERT INTO wrong_questions (user_id, question_id, question_text, your_answer, correct_answer, module)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, question_id) 
       DO UPDATE SET times_wrong = wrong_questions.times_wrong + 1, last_wrong_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, questionId, questionText, yourAnswer, correctAnswer, module]
    );
    return result.rows[0];
  },

  // 获取用户错题
  async getByUser(userId: number) {
    const result = await query(
      'SELECT * FROM wrong_questions WHERE user_id = $1 ORDER BY last_wrong_at DESC',
      [userId]
    );
    return result.rows;
  },

  // 删除错题（答对后）
  async remove(userId: number, questionId: string) {
    await query(
      'DELETE FROM wrong_questions WHERE user_id = $1 AND question_id = $2',
      [userId, questionId]
    );
  },
};

// 收藏相关
export const favoriteDb = {
  // 添加收藏
  async add(userId: number, itemId: string, itemType: string, title: string) {
    const result = await query(
      `INSERT INTO favorites (user_id, item_id, item_type, title)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, item_id, item_type) DO NOTHING
       RETURNING *`,
      [userId, itemId, itemType, title]
    );
    return result.rows[0];
  },

  // 获取用户收藏
  async getByUser(userId: number) {
    const result = await query(
      'SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  // 取消收藏
  async remove(userId: number, itemId: string, itemType: string) {
    await query(
      'DELETE FROM favorites WHERE user_id = $1 AND item_id = $2 AND item_type = $3',
      [userId, itemId, itemType]
    );
  },

  // 检查是否已收藏
  async isFavorited(userId: number, itemId: string, itemType: string) {
    const result = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND item_id = $2 AND item_type = $3',
      [userId, itemId, itemType]
    );
    return result.rows.length > 0;
  },
};

// 成就相关
export const achievementDb = {
  // 解锁成就
  async unlock(userId: number, achievementId: string, title: string, description: string) {
    const result = await query(
      `INSERT INTO achievements (user_id, achievement_id, title, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, achievement_id) DO NOTHING
       RETURNING *`,
      [userId, achievementId, title, description]
    );
    return result.rows[0];
  },

  // 获取用户成就
  async getByUser(userId: number) {
    const result = await query(
      'SELECT * FROM achievements WHERE user_id = $1 ORDER BY unlocked_at DESC',
      [userId]
    );
    return result.rows;
  },
};

export default pool;

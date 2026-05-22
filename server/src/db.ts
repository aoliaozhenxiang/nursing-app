import Database from 'better-sqlite3';
import path from 'path';

// 使用SQLite数据库，文件存储在项目目录
const dbPath = path.join(process.cwd(), 'data', 'app.db');

// 确保data目录存在
import fs from 'fs';
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// 启用 WAL 模式提高性能
db.pragma('journal_mode = WAL');

// 创建表
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nickname TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        module TEXT NOT NULL,
        item_id TEXT,
        item_type TEXT,
        status TEXT DEFAULT 'in_progress',
        score INTEGER DEFAULT 0,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wrong_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        question_id TEXT NOT NULL,
        question_text TEXT,
        your_answer TEXT,
        correct_answer TEXT,
        module TEXT,
        times_wrong INTEGER DEFAULT 1,
        last_wrong_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        item_id TEXT NOT NULL,
        item_type TEXT,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_id TEXT NOT NULL,
        title TEXT,
        description TEXT,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_wrong_user ON wrong_questions(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
`);

// 用户操作
export const userDB = {
    create: (username: string, password: string, nickname?: string) => {
        const stmt = db.prepare('INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)');
        const result = stmt.run(username, password, nickname || null);
        return { id: result.lastInsertRowid, username, nickname };
    },
    findByUsername: (username: string) => {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        return stmt.get(username);
    },
    findById: (id: number) => {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    },
    updatePassword: (id: number, password: string) => {
        const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
        return stmt.run(password, id);
    }
};

// 进度操作
export const progressDB = {
    upsert: (userId: number, module: string, itemId: string, itemType: string, score: number, status: string) => {
        const stmt = db.prepare(`
            INSERT INTO progress (user_id, module, item_id, item_type, score, status, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id, module, item_id) 
            DO UPDATE SET score = ?, status = ?, completed_at = datetime('now'), updated_at = datetime('now')
        `);
        return stmt.run(userId, module, itemId, itemType, score, status, score, status);
    },
    getByUser: (userId: number) => {
        const stmt = db.prepare('SELECT * FROM progress WHERE user_id = ? ORDER BY updated_at DESC');
        return stmt.all(userId);
    },
    getStats: (userId: number) => {
        const totalStmt = db.prepare('SELECT COUNT(*) as total, SUM(score) as totalScore FROM progress WHERE user_id = ?');
        const wrongStmt = db.prepare('SELECT COUNT(*) as wrongCount FROM wrong_questions WHERE user_id = ?');
        const total = totalStmt.get(userId) as any;
        const wrong = wrongStmt.get(userId) as any;
        
        return {
            totalQuestions: total?.total || 0,
            totalScore: total?.totalScore || 0,
            wrongCount: wrong?.wrongCount || 0,
            correctRate: total?.total > 0 ? ((total.totalScore / (total.total * 100)) * 100) : 0
        };
    }
};

// 错题操作
export const wrongDB = {
    add: (userId: number, questionId: string, questionText: string, yourAnswer: string, correctAnswer: string, module: string) => {
        const existing = db.prepare('SELECT * FROM wrong_questions WHERE user_id = ? AND question_id = ?').get(userId, questionId);
        if (existing) {
            const stmt = db.prepare('UPDATE wrong_questions SET times_wrong = times_wrong + 1, last_wrong_at = datetime(\'now\'), your_answer = ? WHERE id = ?');
            return stmt.run(yourAnswer, (existing as any).id);
        } else {
            const stmt = db.prepare('INSERT INTO wrong_questions (user_id, question_id, question_text, your_answer, correct_answer, module) VALUES (?, ?, ?, ?, ?, ?)');
            return stmt.run(userId, questionId, questionText, yourAnswer, correctAnswer, module);
        }
    },
    getByUser: (userId: number) => {
        const stmt = db.prepare('SELECT * FROM wrong_questions WHERE user_id = ? ORDER BY last_wrong_at DESC');
        return stmt.all(userId);
    },
    remove: (userId: number, questionId: string) => {
        const stmt = db.prepare('DELETE FROM wrong_questions WHERE user_id = ? AND question_id = ?');
        return stmt.run(userId, questionId);
    }
};

// 收藏操作
export const favoriteDB = {
    add: (userId: number, itemId: string, itemType: string, title: string) => {
        const stmt = db.prepare('INSERT INTO favorites (user_id, item_id, item_type, title) VALUES (?, ?, ?, ?)');
        return stmt.run(userId, itemId, itemType, title);
    },
    getByUser: (userId: number) => {
        const stmt = db.prepare('SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC');
        return stmt.all(userId);
    },
    remove: (userId: number, itemId: string) => {
        const stmt = db.prepare('DELETE FROM favorites WHERE user_id = ? AND item_id = ?');
        return stmt.run(userId, itemId);
    }
};

// 成就操作
export const achievementDB = {
    add: (userId: number, achievementId: string, title: string, description: string) => {
        const stmt = db.prepare('INSERT INTO achievements (user_id, achievement_id, title, description) VALUES (?, ?, ?, ?)');
        return stmt.run(userId, achievementId, title, description);
    },
    getByUser: (userId: number) => {
        const stmt = db.prepare('SELECT * FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC');
        return stmt.all(userId);
    }
};

export default db;

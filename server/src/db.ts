import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = '/tmp/nursing_app_data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const WRONG_FILE = path.join(DATA_DIR, 'wrong.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');
const ACHIEVEMENTS_FILE = path.join(DATA_DIR, 'achievements.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化文件
[USERS_FILE, PROGRESS_FILE, WRONG_FILE, FAVORITES_FILE, ACHIEVEMENTS_FILE].forEach(file => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '[]', 'utf-8');
    }
});

// 通用读写函数
function readData(file: string): any[] {
    try {
        const content = fs.readFileSync(file, 'utf-8');
        return JSON.parse(content);
    } catch {
        return [];
    }
}

function writeData(file: string, data: any[]): void {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// 用户操作
export const findUserByUsername = (username: string) => {
    const users = readData(USERS_FILE);
    return users.find(u => u.username === username);
};

export const createUser = (user: any) => {
    const users = readData(USERS_FILE);
    users.push(user);
    writeData(USERS_FILE, users);
    return user;
};

export const updateUser = (id: number, updates: any) => {
    const users = readData(USERS_FILE);
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        writeData(USERS_FILE, users);
        return users[index];
    }
    return null;
};

// 学习进度操作
export const getProgress = (userId: number) => readData(PROGRESS_FILE).filter(p => p.user_id === userId);
export const saveProgress = (progress: any) => {
    const data = readData(PROGRESS_FILE);
    const index = data.findIndex(p => p.user_id === progress.user_id && p.chapter_id === progress.chapter_id);
    if (index !== -1) {
        data[index] = progress;
    } else {
        data.push(progress);
    }
    writeData(PROGRESS_FILE, data);
};

// 错题本操作
export const getWrongQuestions = (userId: number) => readData(WRONG_FILE).filter(w => w.user_id === userId);
export const addWrongQuestion = (q: any) => {
    const data = readData(WRONG_FILE);
    const exist = data.find(w => w.user_id === q.user_id && w.question_id === q.question_id);
    if (exist) {
        exist.wrong_count++;
    } else {
        data.push(q);
    }
    writeData(WRONG_FILE, data);
};

// 收藏操作
export const getFavorites = (userId: number) => readData(FAVORITES_FILE).filter(f => f.user_id === userId);
export const addFavorite = (fav: any) => {
    const data = readData(FAVORITES_FILE);
    data.push(fav);
    writeData(FAVORITES_FILE, data);
};
export const removeFavorite = (userId: number, id: number) => {
    const data = readData(FAVORITES_FILE).filter(f => !(f.user_id === userId && f.id === id));
    writeData(FAVORITES_FILE, data);
};

// 成就操作
export const getAchievements = (userId: number) => readData(ACHIEVEMENTS_FILE).filter(a => a.user_id === userId);
export const addAchievement = (ach: any) => {
    const data = readData(ACHIEVEMENTS_FILE);
    data.push(ach);
    writeData(ACHIEVEMENTS_FILE, data);
};

// 生成ID
export const generateId = (file: string) => {
    const data = readData(file);
    return data.length > 0 ? Math.max(...data.map((d: any) => d.id || 0)) + 1 : 1;
};

import { Router } from 'express';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nursing-app-secret-key-2024';

// 护理专家系统提示词
const NURSING_SYSTEM_PROMPT = `你是"慈航护理学堂"的AI导师，专注于养老护理员四级（中级工）职业技能培训。

你的职责：
1. 回答养老护理相关的理论知识和实操问题
2. 指导学员学习职业道德、生活照护、基础照护、康复服务、心理支持等模块
3. 提供操作步骤的详细讲解和注意事项
4. 帮助学员理解考试重点和难点

回答规范：
- 使用专业但易懂的语言
- 结合实际护理场景举例
- 适当引用《养老护理员国家职业技能标准》
- 对于操作类问题，给出清晰的步骤说明
- 如涉及安全要点，重点强调

如果你不确定某个问题的答案，请诚实告知学员，并建议查阅官方教材。`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// AI对话
router.post('/chat', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: '请先登录' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    
    const { messages } = req.body as { messages: Message[] };
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: '请提供对话内容' });
    }

    const config = new Config();
    const client = new LLMClient(config);

    // 构建带系统提示的消息
    const llmMessages = [
      { role: 'system' as const, content: NURSING_SYSTEM_PROMPT },
      ...messages
    ];

    const response = await client.invoke(llmMessages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7
    });

    res.json({
      success: true,
      content: response.content,
      user: decoded.username
    });

  } catch (error: any) {
    console.error('AI对话错误:', error);
    res.status(500).json({ error: 'AI回复失败，请稍后重试' });
  }
});

// 做题分析报告
router.post('/analyze', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: '请先登录' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };

    const { 
      totalQuestions, 
      correctCount, 
      wrongQuestions,
      categoryStats 
    } = req.body as {
      totalQuestions: number;
      correctCount: number;
      wrongQuestions: Array<{ question: string; userAnswer: string; correctAnswer: string; category: string }>;
      categoryStats: Record<string, { total: number; correct: number }>;
    };

    if (!totalQuestions) {
      return res.status(400).json({ error: '请提供做题数据' });
    }

    const config = new Config();
    const client = new LLMClient(config);

    // 构建分析提示词
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    const analyzePrompt = `请分析以下养老护理员四级考试做题数据，生成个性化的学习分析报告：

## 基本数据
- 总题数：${totalQuestions}
- 正确数：${correctCount}
- 正确率：${accuracy}%

## 分类统计
${Object.entries(categoryStats || {}).map(([cat, stat]: [string, any]) => 
  `- ${cat}: ${stat.total}题，正确${stat.correct}题`
).join('\n')}

## 错题详情
${(wrongQuestions || []).map((w: any, i: number) => 
  `${i + 1}. 题目：${w.question}\n   您的答案：${w.userAnswer}\n   正确答案：${w.correctAnswer}\n   分类：${w.category}`
).join('\n')}

请生成一份详细的学习分析报告，包含：
1. 整体评价和等级（优秀/良好/及格/需努力）
2. 各模块掌握情况分析
3. 错题知识点解析和正确做法
4. 个性化学习建议
5. 推荐重点复习内容`;

    const messages = [
      { role: 'system' as const, content: '你是一位专业的养老护理培训导师，擅长分析学生的学习数据并给出针对性的学习建议。' },
      { role: 'user' as const, content: analyzePrompt }
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.6
    });

    res.json({
      success: true,
      report: response.content,
      stats: {
        totalQuestions,
        correctCount,
        accuracy,
        categoryStats
      }
    });

  } catch (error: any) {
    console.error('分析报告生成错误:', error);
    res.status(500).json({ error: '生成分析报告失败，请稍后重试' });
  }
});

export default router;

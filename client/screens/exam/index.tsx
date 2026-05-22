/**
 * 刷题考试页面
 * 
 * 功能：
 * 1. 章节练习
 * 2. 模拟考试
 * 3. 错题本
 * 4. 收藏夹
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';

// 柔和卡片风配色
const COLORS = {
  primary: '#6C63FF',
  primaryEnd: '#896BFF',
  secondary: '#FF6584',
  background: '#F0F0F3',
  card: '#F0F0F3',
  inset: '#E8E8EB',
  shadowDark: '#D1D9E6',
  shadowLight: '#FFFFFF',
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#FF6B6B',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textPlaceholder: '#B2BEC3',
};

// 题目类型
const QUESTION_TYPES = [
  { id: 'single', name: '单选题', count: 150, color: COLORS.primary },
  { id: 'multiple', name: '多选题', count: 80, color: COLORS.secondary },
  { id: 'judge', name: '判断题', count: 120, color: COLORS.success },
  { id: 'brief', name: '简答题', count: 50, color: COLORS.warning },
];

// 模拟试卷数据
const EXAM_PAPERS = [
  {
    id: 1,
    title: '第一章 章节测试',
    questions: 30,
    duration: 45,
    completed: true,
    score: 85,
  },
  {
    id: 2,
    title: '第二章 章节测试',
    questions: 35,
    duration: 50,
    completed: true,
    score: 72,
  },
  {
    id: 3,
    title: '第三章 章节测试',
    questions: 40,
    duration: 60,
    completed: false,
    score: null,
  },
  {
    id: 4,
    title: '全真模拟考试（一）',
    questions: 100,
    duration: 120,
    completed: false,
    score: null,
  },
];

// 示例题目
const SAMPLE_QUESTION = {
  id: 1,
  type: 'single',
  chapter: '第一章',
  content: '老年人最佳的睡眠姿势是？',
  options: [
    { id: 'A', text: '仰卧位', isCorrect: false },
    { id: 'B', text: '俯卧位', isCorrect: false },
    { id: 'C', text: '左侧卧位', isCorrect: false },
    { id: 'D', text: '右侧卧位', isCorrect: true },
  ],
  explanation: '老年人宜采用右侧卧位休息，这样可以减轻心脏负担，促进胃肠蠕动，也有利于呼吸。',
  difficulty: '基础',
};

// 错题数据
const WRONG_QUESTIONS = [
  {
    id: 1,
    content: '老年人服用铁剂时，正确的护理方法是？',
    wrongAnswer: '与茶水同服',
    correctAnswer: '用吸管服用，避免牙齿染色',
    chapter: '第二章',
  },
  {
    id: 2,
    content: '测量血压时，袖带的位置应该是？',
    wrongAnswer: '肘窝上1cm处',
    correctAnswer: '肘窝上2-3cm处',
    chapter: '第三章',
  },
];

// 图标组件
const Icon = ({ name, size = 20, color = '#6C63FF' }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, string> = {
    'back': '←',
    'single': '○',
    'multiple': '☐',
    'judge': '✓',
    'brief': '📝',
    'exam': '📋',
    'wrong': '❌',
    'star': '☆',
    'clock': '⏰',
    'check': '✓',
    'play': '▶️',
    'close': '✕',
  };
  return <Text style={{ fontSize: size }}>{icons[name] || '📱'}</Text>;
};

// 软卡片组件
const SoftCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.shadowDark, style]}>
    <View style={[styles.shadowLight, styles.card, style]}>
      {children}
    </View>
  </View>
);

// 题型按钮组件
const TypeButton = ({ type, active, onPress }: { type: typeof QUESTION_TYPES[0]; active: boolean; onPress: () => void }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.typeButton}>
    <View style={[styles.typeButtonInner, active && { backgroundColor: type.color }]}>
      <View style={[styles.typeIconBg, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : `${type.color}15` }]}>
        <Icon name={type.id === 'single' ? 'single' : type.id === 'multiple' ? 'multiple' : type.id === 'judge' ? 'judge' : 'brief'} size={16} color={active ? '#FFFFFF' : type.color} />
      </View>
      <Text style={[styles.typeName, active && styles.typeNameActive]}>{type.name}</Text>
      <Text style={[styles.typeCount, active && styles.typeCountActive]}>{type.count}题</Text>
    </View>
  </TouchableOpacity>
);

export default function ExamScreen() {
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<'practice' | 'paper' | 'wrong'>('practice');
  const [selectedType, setSelectedType] = useState<string>('single');
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleStartPractice = () => {
    setQuestionModalVisible(true);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleSelectAnswer = (optionId: string) => {
    if (!showExplanation) {
      setSelectedAnswer(optionId);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      setShowExplanation(true);
    }
  };

  return (
    <Screen backgroundColor={COLORS.background} safeAreaEdges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name="back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>刷题考试</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 顶部Banner */}
      <View style={styles.banner}>
        <LinearGradient
          colors={[COLORS.success, '#00C9A7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerTitle}>题库练习</Text>
              <Text style={styles.bannerSubtitle}>精选500+题目</Text>
              <View style={styles.bannerStats}>
                <View style={styles.bannerStat}>
                  <Text style={styles.bannerStatNumber}>400</Text>
                  <Text style={styles.bannerStatLabel}>已做</Text>
                </View>
                <View style={styles.bannerDivider} />
                <View style={styles.bannerStat}>
                  <Text style={styles.bannerStatNumber}>100</Text>
                  <Text style={styles.bannerStatLabel}>未做</Text>
                </View>
              </View>
            </View>
            <View style={styles.bannerIcon}>
              <Icon name="exam" size={48} color="rgba(255,255,255,0.3)" />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Tab切换 */}
      <View style={styles.tabContainer}>
        {([
          { key: 'practice', label: '章节练习' },
          { key: 'paper', label: '模拟试卷' },
          { key: 'wrong', label: '错题本' },
        ] as const).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* 内容区域 */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'practice' && (
          <>
            {/* 题型选择 */}
            <View style={styles.typeGrid}>
              {QUESTION_TYPES.map((type) => (
                <TypeButton
                  key={type.id}
                  type={type}
                  active={selectedType === type.id}
                  onPress={() => setSelectedType(type.id)}
                />
              ))}
            </View>

            {/* 开始练习按钮 */}
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={handleStartPractice}
              style={styles.startButton}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryEnd]}
                style={styles.startButtonGradient}
              >
                <Icon name="play" size={20} color="#FFFFFF" />
                <Text style={styles.startButtonText}>开始练习</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 今日练习统计 */}
            <SoftCard style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>今日练习</Text>
                <Text style={styles.statsDate}>2024年1月15日</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: COLORS.primary }]}>25</Text>
                  <Text style={styles.statLabel}>练习题数</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: COLORS.success }]}>80%</Text>
                  <Text style={styles.statLabel}>正确率</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: COLORS.secondary }]}>3</Text>
                  <Text style={styles.statLabel}>连续天数</Text>
                </View>
              </View>
            </SoftCard>
          </>
        )}

        {activeTab === 'paper' && (
          <View style={styles.paperList}>
            {EXAM_PAPERS.map((paper) => (
              <TouchableOpacity
                key={paper.id}
                activeOpacity={0.9}
                onPress={() => {}}
                style={styles.paperCard}
              >
                <View style={styles.paperInfo}>
                  <View style={styles.paperHeader}>
                    <Text style={styles.paperTitle}>{paper.title}</Text>
                    {paper.completed && (
                      <View style={[styles.completedBadge, { backgroundColor: COLORS.success }]}>
                        <Icon name="check" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <View style={styles.paperMeta}>
                    <View style={styles.paperMetaItem}>
                      <Icon name="single" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.paperMetaText}>{paper.questions}题</Text>
                    </View>
                    <View style={styles.paperMetaItem}>
                      <Icon name="clock" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.paperMetaText}>{paper.duration}分钟</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.paperAction}>
                  {paper.completed ? (
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreText, { color: paper.score >= 60 ? COLORS.success : COLORS.error }]}>
                        {paper.score}分
                      </Text>
                      <Text style={styles.reviewText}>查看成绩</Text>
                    </View>
                  ) : (
                    <TouchableOpacity activeOpacity={0.8} style={styles.startExamButton}>
                      <Text style={styles.startExamText}>开始考试</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'wrong' && (
          <View style={styles.wrongList}>
            {WRONG_QUESTIONS.map((question) => (
              <SoftCard key={question.id} style={styles.wrongCard}>
                <View style={styles.wrongHeader}>
                  <View style={[styles.chapterTag, { backgroundColor: 'rgba(108,99,255,0.1)' }]}>
                    <Text style={styles.chapterTagText}>{question.chapter}</Text>
                  </View>
                  <View style={[styles.wrongTag, { backgroundColor: 'rgba(255,107,107,0.1)' }]}>
                    <Icon name="wrong" size={12} color={COLORS.error} />
                    <Text style={styles.wrongTagText}>答错</Text>
                  </View>
                </View>
                <Text style={styles.wrongQuestion}>{question.content}</Text>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>你的答案：</Text>
                  <Text style={[styles.answerText, { color: COLORS.error }]}>{question.wrongAnswer}</Text>
                </View>
                <View style={styles.answerRow}>
                  <Text style={styles.answerLabel}>正确答案：</Text>
                  <Text style={[styles.answerText, { color: COLORS.success }]}>{question.correctAnswer}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.8} style={styles.reviewButton}>
                  <Icon name="play" size={14} color={COLORS.primary} />
                  <Text style={styles.reviewButtonText}>重新学习</Text>
                </TouchableOpacity>
              </SoftCard>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 题目练习Modal */}
      <Modal
        visible={questionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setQuestionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalTitle}>单选题</Text>
                <View style={styles.questionCounter}>
                  <Text style={styles.questionCounterText}>1/30</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setQuestionModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* 进度条 */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '3%' }]} />
            </View>

            {/* 题目内容 */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.questionScroll}>
              <View style={styles.questionContainer}>
                <View style={styles.questionMeta}>
                  <View style={[styles.chapterBadge, { backgroundColor: 'rgba(108,99,255,0.1)' }]}>
                    <Text style={styles.chapterBadgeText}>{SAMPLE_QUESTION.chapter}</Text>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: 'rgba(0,184,148,0.1)' }]}>
                    <Text style={[styles.difficultyBadgeText, { color: COLORS.success }]}>
                      {SAMPLE_QUESTION.difficulty}
                    </Text>
                  </View>
                </View>
                <Text style={styles.questionContent}>{SAMPLE_QUESTION.content}</Text>

                {/* 选项 */}
                <View style={styles.optionsContainer}>
                  {SAMPLE_QUESTION.options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      activeOpacity={0.8}
                      onPress={() => handleSelectAnswer(option.id)}
                      disabled={showExplanation}
                      style={[
                        styles.optionItem,
                        selectedAnswer === option.id && styles.optionSelected,
                        showExplanation && option.isCorrect && styles.optionCorrect,
                        showExplanation && selectedAnswer === option.id && !option.isCorrect && styles.optionWrong,
                      ]}
                    >
                      <View style={[
                        styles.optionCircle,
                        selectedAnswer === option.id && styles.optionCircleSelected,
                        showExplanation && option.isCorrect && styles.optionCircleCorrect,
                        showExplanation && selectedAnswer === option.id && !option.isCorrect && styles.optionCircleWrong,
                      ]}>
                        <Text style={[
                          styles.optionLetter,
                          selectedAnswer === option.id && styles.optionLetterSelected,
                          showExplanation && option.isCorrect && styles.optionLetterCorrect,
                        ]}>
                          {option.id}
                        </Text>
                      </View>
                      <Text style={[
                        styles.optionText,
                        selectedAnswer === option.id && styles.optionTextSelected,
                        showExplanation && option.isCorrect && styles.optionTextCorrect,
                      ]}>
                        {option.text}
                      </Text>
                      {showExplanation && option.isCorrect && (
                        <Icon name="check" size={18} color={COLORS.success} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 解析 */}
                {showExplanation && (
                  <View style={styles.explanationContainer}>
                    <View style={styles.explanationHeader}>
                      <Icon name="brief" size={16} color={COLORS.primary} />
                      <Text style={styles.explanationTitle}>答案解析</Text>
                    </View>
                    <Text style={styles.explanationText}>{SAMPLE_QUESTION.explanation}</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* 底部按钮 */}
            <View style={styles.modalFooter}>
              {!showExplanation ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSubmit}
                  disabled={!selectedAnswer}
                  style={[styles.submitButton, !selectedAnswer && styles.submitButtonDisabled]}
                >
                  <Text style={styles.submitButtonText}>提交答案</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setQuestionModalVisible(false)}
                  style={styles.nextButton}
                >
                  <Text style={styles.nextButtonText}>下一题</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  headerRight: { width: 40 },
  // Banner
  banner: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: COLORS.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  bannerGradient: { padding: 20 },
  bannerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerLeft: { flex: 1 },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  bannerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  bannerStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bannerStat: { alignItems: 'center' },
  bannerStatNumber: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  bannerStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  bannerDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  bannerIcon: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  // Tab
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: COLORS.inset,
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: {
    backgroundColor: COLORS.card,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.success },
  tabIndicator: { position: 'absolute', bottom: 0, width: 20, height: 3, backgroundColor: COLORS.success, borderRadius: 2 },
  // Content
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeButton: { width: '48%' },
  typeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  typeIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  typeName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  typeNameActive: { color: '#FFFFFF' },
  typeCount: { fontSize: 11, color: COLORS.textSecondary },
  typeCountActive: { color: 'rgba(255,255,255,0.8)' },
  startButton: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  startButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  // Stats Card
  statsCard: { padding: 16 },
  statsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statsTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  statsDate: { fontSize: 12, color: COLORS.textSecondary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  // Paper List
  paperList: { gap: 12 },
  paperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  paperInfo: { flex: 1 },
  paperHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  paperTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  completedBadge: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  paperMeta: { flexDirection: 'row', gap: 16 },
  paperMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  paperMetaText: { fontSize: 12, color: COLORS.textSecondary },
  paperAction: { alignItems: 'flex-end' },
  scoreContainer: { alignItems: 'flex-end' },
  scoreText: { fontSize: 24, fontWeight: '800' },
  reviewText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  startExamButton: {
    backgroundColor: 'rgba(0,184,148,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  startExamText: { fontSize: 14, fontWeight: '600', color: COLORS.success },
  // Wrong List
  wrongList: { gap: 12 },
  wrongCard: { padding: 16 },
  wrongHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  chapterTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  chapterTagText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  wrongTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  wrongTagText: { fontSize: 12, fontWeight: '600', color: COLORS.error },
  wrongQuestion: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 12, lineHeight: 20 },
  answerRow: { flexDirection: 'row', marginBottom: 8 },
  answerLabel: { fontSize: 13, color: COLORS.textSecondary },
  answerText: { fontSize: 13, fontWeight: '500' },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  reviewButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  questionCounter: {
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  questionCounterText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.inset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: { height: 4, backgroundColor: COLORS.inset, marginHorizontal: 20 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  questionScroll: { flex: 1 },
  questionContainer: { padding: 20 },
  questionMeta: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chapterBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  chapterBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  difficultyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  difficultyBadgeText: { fontSize: 12, fontWeight: '600' },
  questionContent: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, lineHeight: 24, marginBottom: 20 },
  optionsContainer: { gap: 12 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: 'rgba(108,99,255,0.05)' },
  optionCorrect: { borderColor: COLORS.success, backgroundColor: 'rgba(0,184,148,0.05)' },
  optionWrong: { borderColor: COLORS.error, backgroundColor: 'rgba(255,107,107,0.05)' },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.inset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCircleSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  optionCircleCorrect: { borderColor: COLORS.success, backgroundColor: COLORS.success },
  optionCircleWrong: { borderColor: COLORS.error, backgroundColor: COLORS.error },
  optionLetter: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  optionLetterSelected: { color: '#FFFFFF' },
  optionLetterCorrect: { color: '#FFFFFF' },
  optionText: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  optionTextSelected: { fontWeight: '600' },
  optionTextCorrect: { fontWeight: '600', color: COLORS.success },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(108,99,255,0.05)',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  explanationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  explanationTitle: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  explanationText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  modalFooter: { padding: 20, paddingBottom: 34 },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: { backgroundColor: COLORS.inset },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  nextButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  // Shadow styles
  shadowDark: {
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.7, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  shadowLight: {
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowLight, shadowOffset: { width: -4, height: -4 }, shadowOpacity: 0.9, shadowRadius: 8 },
    }),
  },
  card: { backgroundColor: COLORS.card, borderRadius: 20 },
});

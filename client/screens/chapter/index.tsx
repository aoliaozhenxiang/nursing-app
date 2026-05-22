/**
 * 章节详情页面
 * 
 * 功能：
 * 1. Tab切换：理论学习 | 实操练习 | 刷题
 * 2. 章节内容展示
 * 3. 学习进度
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
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

// 章节数据
const CHAPTER = {
  id: 1,
  title: '第一章',
  subtitle: '养老护理基础理论',
  totalLessons: 12,
  completedLessons: 8,
  progress: 67,
};

// 视频列表
const VIDEOS = [
  { id: 1, title: '养老护理员职业道德规范', duration: '15:30', watched: true },
  { id: 2, title: '老年人生理特点与心理需求', duration: '22:45', watched: true },
  { id: 3, title: '养老护理安全防护知识', duration: '18:20', watched: false },
  { id: 4, title: '老年人生活照料概述', duration: '20:15', watched: false },
];

// 操作技能
const SKILLS = [
  { id: 1, title: '翻身拍背护理', difficulty: '基础', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400' },
  { id: 2, title: '口腔清洁护理', difficulty: '基础', imageUrl: 'https://images.unsplash.com/photo-1584539696499-12a1d0c4e138?w=400' },
];

// 题目统计
const QUESTIONS = [
  { type: '单选题', count: 30, completed: 25 },
  { type: '多选题', count: 15, completed: 10 },
  { type: '判断题', count: 25, completed: 20 },
  { type: '简答题', count: 10, completed: 5 },
];

// 图标组件
const Icon = ({ name, size = 20, color = '#6C63FF' }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, string> = {
    'back': '←',
    'play': '▶️',
    'check': '✓',
    'video': '🎬',
    'practice': '🖼️',
    'exam': '✏️',
    'clock': '⏰',
    'book': '📖',
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

export default function ChapterDetailScreen() {
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<'theory' | 'practice' | 'exam'>('theory');

  return (
    <Screen backgroundColor={COLORS.background} safeAreaEdges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name="back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{CHAPTER.title}</Text>
          <Text style={styles.headerSubtitle}>{CHAPTER.subtitle}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* 章节进度Banner */}
      <View style={styles.progressBanner}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.progressBannerGradient}
        >
          <View style={styles.progressInfo}>
            <View>
              <Text style={styles.progressLabel}>章节进度</Text>
              <Text style={styles.progressValue}>{CHAPTER.completedLessons}/{CHAPTER.totalLessons}节</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>{CHAPTER.progress}%</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${CHAPTER.progress}%` }]} />
          </View>
        </LinearGradient>
      </View>

      {/* Tab切换 */}
      <View style={styles.tabContainer}>
        {([
          { key: 'theory', label: '理论学习', icon: '📖' },
          { key: 'practice', label: '实操练习', icon: '🖼️' },
          { key: 'exam', label: '章节刷题', icon: '✏️' },
        ] as const).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
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
        {activeTab === 'theory' && (
          <View style={styles.theoryContent}>
            {/* 学习目标 */}
            <SoftCard style={styles.objectiveCard}>
              <View style={styles.objectiveHeader}>
                <Text style={styles.objectiveTitle}>学习目标</Text>
              </View>
              <View style={styles.objectiveList}>
                <View style={styles.objectiveItem}>
                  <Icon name="check" size={14} color={COLORS.success} />
                  <Text style={styles.objectiveText}>掌握养老护理员的职业道德规范</Text>
                </View>
                <View style={styles.objectiveItem}>
                  <Icon name="check" size={14} color={COLORS.success} />
                  <Text style={styles.objectiveText}>了解老年人生理和心理特点</Text>
                </View>
                <View style={styles.objectiveItem}>
                  <Icon name="check" size={14} color={COLORS.success} />
                  <Text style={styles.objectiveText}>熟悉安全防护基本知识</Text>
                </View>
              </View>
            </SoftCard>

            {/* 视频列表 */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>视频课程</Text>
              <Text style={styles.sectionCount}>{VIDEOS.length}个视频</Text>
            </View>
            {VIDEOS.map((video) => (
              <TouchableOpacity key={video.id} activeOpacity={0.9} style={styles.videoItem}>
                <View style={styles.videoThumbnail}>
                  <View style={styles.videoPlayButton}>
                    <Icon name="play" size={16} color="#FFFFFF" />
                  </View>
                  {video.watched && (
                    <View style={styles.watchedBadge}>
                      <Icon name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <View style={styles.videoMeta}>
                    <Icon name="clock" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.videoDuration}>{video.duration}</Text>
                    {video.watched && (
                      <View style={styles.videoWatched}>
                        <Text style={styles.videoWatchedText}>已看完</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'practice' && (
          <View style={styles.practiceContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>实操技能</Text>
              <Text style={styles.sectionCount}>{SKILLS.length}个技能</Text>
            </View>
            {SKILLS.map((skill) => (
              <TouchableOpacity key={skill.id} activeOpacity={0.9} style={styles.skillItem}>
                <Image source={{ uri: skill.imageUrl }} style={styles.skillImage} />
                <View style={styles.skillOverlay}>
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillTitle}>{skill.title}</Text>
                    <View style={styles.skillBadge}>
                      <Text style={styles.skillBadgeText}>{skill.difficulty}</Text>
                    </View>
                  </View>
                  <TouchableOpacity activeOpacity={0.8} style={styles.practiceButton}>
                    <Text style={styles.practiceButtonText}>开始练习</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'exam' && (
          <View style={styles.examContent}>
            {/* 题目统计 */}
            <SoftCard style={styles.statsCard}>
              <Text style={styles.statsTitle}>本章题目</Text>
              <View style={styles.statsGrid}>
                {QUESTIONS.map((q, index) => (
                  <View key={index} style={styles.statBox}>
                    <Text style={styles.statNumber}>{q.completed}/{q.count}</Text>
                    <Text style={styles.statLabel}>{q.type}</Text>
                    <View style={styles.statProgressBg}>
                      <View style={[styles.statProgressFill, { width: `${(q.completed / q.count) * 100}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            </SoftCard>

            {/* 开始刷题按钮 */}
            <TouchableOpacity activeOpacity={0.9} style={styles.startExamButton}>
              <LinearGradient
                colors={[COLORS.success, '#00C9A7']}
                style={styles.startExamGradient}
              >
                <Icon name="exam" size={20} color="#FFFFFF" />
                <Text style={styles.startExamText}>开始本章练习</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 知识点 */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>本章知识点</Text>
            </View>
            <SoftCard style={styles.knowledgeCard}>
              {['职业道德基本规范', '老年人心理特征', '生活照料原则', '安全防护要点'].map((item, index) => (
                <View key={index} style={styles.knowledgeItem}>
                  <View style={[styles.knowledgeDot, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.knowledgeText}>{item}</Text>
                </View>
              ))}
            </SoftCard>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  // Progress Banner
  progressBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  progressBannerGradient: {
    padding: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  // Tab
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: COLORS.inset,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.card,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  tabIcon: { fontSize: 16 },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary },
  tabIndicator: { position: 'absolute', bottom: 0, width: 20, height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  // Content
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  // Theory
  theoryContent: { gap: 16 },
  objectiveCard: { padding: 16 },
  objectiveHeader: { marginBottom: 12 },
  objectiveTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  objectiveList: { gap: 10 },
  objectiveItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  objectiveText: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  sectionCount: { fontSize: 12, color: COLORS.textSecondary },
  videoItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  videoThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.inset,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  videoTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6 },
  videoMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  videoDuration: { fontSize: 12, color: COLORS.textSecondary },
  videoWatched: { backgroundColor: 'rgba(0,184,148,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  videoWatchedText: { fontSize: 10, fontWeight: '600', color: COLORS.success },
  // Practice
  practiceContent: { gap: 12 },
  skillItem: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  skillImage: { width: '100%', height: 160 },
  skillOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    padding: 16,
  },
  skillInfo: { gap: 6 },
  skillTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  skillBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  skillBadgeText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF' },
  practiceButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  practiceButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  // Exam
  examContent: { gap: 16 },
  statsCard: { padding: 16 },
  statsTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statBox: { width: '47%' },
  statNumber: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  statProgressBg: { height: 4, backgroundColor: COLORS.inset, borderRadius: 2, overflow: 'hidden' },
  statProgressFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 2 },
  startExamButton: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: COLORS.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  startExamGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  startExamText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  knowledgeCard: { padding: 16 },
  knowledgeItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  knowledgeDot: { width: 6, height: 6, borderRadius: 3 },
  knowledgeText: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
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

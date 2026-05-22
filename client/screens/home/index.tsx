/**
 * 首页 - 养老护理员考证助手
 * 
 * 功能：
 * 1. 欢迎语 + 学习天数统计
 * 2. 三大功能入口卡片：理论学、实操练、考题考
 * 3. 学习进度总览
 * 4. 继续学习入口
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

// 学习数据模拟
const STUDY_DATA = {
  days: 15,
  theoryProgress: 45,
  practiceProgress: 30,
  examProgress: 60,
  totalQuestions: 500,
  completedQuestions: 230,
};

// 功能模块数据
const MODULES = [
  {
    id: 'theory',
    title: '理论学习',
    subtitle: '视频+PPT教学',
    icon: 'book-open',
    iconBg: 'rgba(108,99,255,0.12)',
    iconColor: '#6C63FF',
    gradient: ['#6C63FF', '#896BFF'],
    route: '/theory',
  },
  {
    id: 'practice',
    title: '实操练习',
    subtitle: '图片对比训练',
    icon: 'image',
    iconBg: 'rgba(255,101,132,0.12)',
    iconColor: '#FF6584',
    gradient: ['#FF6584', '#FF8FA3'],
    route: '/practice',
  },
  {
    id: 'exam',
    title: '刷题考试',
    subtitle: '章节+模拟考试',
    icon: 'edit',
    iconBg: 'rgba(0,184,148,0.12)',
    iconColor: '#00B894',
    gradient: ['#00B894', '#00C9A7'],
    route: '/exam',
  },
];

// 继续学习章节数据
const CONTINUE_LEARNING = [
  {
    id: 1,
    chapter: '第一章',
    title: '养老护理基础理论',
    progress: 65,
    type: 'theory',
  },
  {
    id: 2,
    chapter: '第二章',
    title: '生活照料基本技能',
    progress: 30,
    type: 'practice',
  },
];

// 图标组件
const Icon = ({ name, size = 22, color = '#6C63FF' }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, string> = {
    'book-open': '📖',
    'image': '🖼️',
    'edit': '✏️',
    'gamepad': '🎮',
    'user': '👤',
    'clock': '⏰',
    'trophy': '🏆',
    'fire': '🔥',
    'check': '✓',
    'play': '▶️',
    'chart': '📊',
  };
  return <Text style={{ fontSize: size }}>{icons[name] || '📱'}</Text>;
};

// 软卡片组件 - 凸起效果
const SoftCard = ({ children, style, onPress }: { children: React.ReactNode; style?: any; onPress?: () => void }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={[
        styles.shadowDark,
        { transform: [{ scale: isPressed ? 0.97 : 1 }] },
      ]}
    >
      <View style={[styles.shadowLight, styles.card, style]}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

// 功能卡片组件
const ModuleCard = ({ module }: { module: typeof MODULES[0] }) => {
  const router = useSafeRouter();
  
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(module.route as any)}
      style={[styles.moduleCardWrapper, { transform: [{ scale: 1 }] }]}
    >
      <LinearGradient
        colors={module.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.moduleCardGradient}
      >
        <View style={[styles.moduleIconContainer, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
          <Icon name={module.icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.moduleTitle}>{module.title}</Text>
        <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// 进度环组件
const ProgressRing = ({ progress, size = 48, strokeWidth = 6, color = '#6C63FF' }: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <View style={{ width: size, height: size }}>
      <View style={styles.progressRingBackground}>
        <View style={[styles.progressRingCircle, {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#E8E8EB',
        }]} />
      </View>
      <View style={[styles.progressRingForeground, {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: color,
        borderTopColor: 'transparent',
        borderRightColor: progress > 25 ? color : 'transparent',
        borderBottomColor: progress > 50 ? color : 'transparent',
        borderLeftColor: progress > 75 ? color : 'transparent',
        transform: [{ rotate: '-45deg' }],
      }]} />
      <View style={[styles.progressCenter, { width: size - strokeWidth * 2, height: size - strokeWidth * 2 }]}>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <Screen backgroundColor={COLORS.background} safeAreaEdges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 顶部欢迎区域 */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>欢迎回来</Text>
              <Text style={styles.mainTitle}>养老护理员考证助手</Text>
            </View>
            <View style={styles.userInfo}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(108,99,255,0.12)' }]}>
                <Icon name="user" size={22} color={COLORS.primary} />
              </View>
            </View>
          </View>
          
          {/* 学习统计卡片 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: 'rgba(108,99,255,0.12)' }]}>
                <Icon name="fire" size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.statNumber}>{STUDY_DATA.days}</Text>
                <Text style={styles.statLabel}>学习天数</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: 'rgba(255,101,132,0.12)' }]}>
                <Icon name="trophy" size={16} color={COLORS.secondary} />
              </View>
              <View>
                <Text style={styles.statNumber}>{STUDY_DATA.completedQuestions}</Text>
                <Text style={styles.statLabel}>已做题数</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* 三大功能入口 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习中心</Text>
          <View style={styles.moduleGrid}>
            {MODULES.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </View>
        </View>
        
        {/* 闯关记忆入口 */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => {}}
          style={styles.memoryBanner}
        >
          <LinearGradient
            colors={['#6C63FF', '#896BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.memoryBannerGradient}
          >
            <View style={styles.memoryBannerLeft}>
              <Icon name="gamepad" size={28} color="#FFFFFF" />
              <View style={styles.memoryBannerText}>
                <Text style={styles.memoryBannerTitle}>闯关记忆</Text>
                <Text style={styles.memoryBannerSubtitle}>游戏化学习，记忆更深刻</Text>
              </View>
            </View>
            <View style={styles.memoryBannerBadge}>
              <Text style={styles.memoryBannerBadgeText}>新功能</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* 学习进度总览 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>学习进度</Text>
            <Icon name="chart" size={18} color={COLORS.textSecondary} />
          </View>
          <SoftCard style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>整体进度</Text>
              <Text style={styles.progressPercent}>{(STUDY_DATA.theoryProgress + STUDY_DATA.practiceProgress + STUDY_DATA.examProgress) / 3}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View style={[
                  styles.progressBarFill,
                  { width: `${(STUDY_DATA.theoryProgress + STUDY_DATA.practiceProgress + STUDY_DATA.examProgress) / 3}%` }
                ]} />
              </View>
            </View>
            <View style={styles.progressDetails}>
              <View style={styles.progressDetailItem}>
                <View style={[styles.progressDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.progressDetailLabel}>理论</Text>
                <Text style={styles.progressDetailValue}>{STUDY_DATA.theoryProgress}%</Text>
              </View>
              <View style={styles.progressDetailItem}>
                <View style={[styles.progressDot, { backgroundColor: COLORS.secondary }]} />
                <Text style={styles.progressDetailLabel}>实操</Text>
                <Text style={styles.progressDetailValue}>{STUDY_DATA.practiceProgress}%</Text>
              </View>
              <View style={styles.progressDetailItem}>
                <View style={[styles.progressDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.progressDetailLabel}>刷题</Text>
                <Text style={styles.progressDetailValue}>{STUDY_DATA.examProgress}%</Text>
              </View>
            </View>
          </SoftCard>
        </View>
        
        {/* 继续学习 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>继续学习</Text>
            <Text style={styles.sectionMore}>查看全部</Text>
          </View>
          {CONTINUE_LEARNING.map((item) => (
            <SoftCard key={item.id} style={styles.continueCard}>
              <View style={styles.continueCardContent}>
                <View style={[styles.continueChapter, { backgroundColor: item.type === 'theory' ? 'rgba(108,99,255,0.12)' : 'rgba(255,101,132,0.12)' }]}>
                  <Text style={[styles.continueChapterText, { color: item.type === 'theory' ? COLORS.primary : COLORS.secondary }]}>
                    {item.chapter}
                  </Text>
                </View>
                <View style={styles.continueInfo}>
                  <Text style={styles.continueTitle}>{item.title}</Text>
                  <View style={styles.continueProgressContainer}>
                    <View style={styles.continueProgressBg}>
                      <View style={[styles.continueProgressFill, { width: `${item.progress}%` }]} />
                    </View>
                    <Text style={styles.continueProgressText}>{item.progress}%</Text>
                  </View>
                </View>
                <View style={styles.continuePlay}>
                  <Icon name="play" size={20} color={COLORS.primary} />
                </View>
              </View>
            </SoftCard>
          ))}
        </View>
        
        {/* 底部安全区 */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  // 头部区域
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 统计行
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  // 区块样式
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  sectionMore: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // 功能卡片网格
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduleCardWrapper: {
    width: '47%',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  moduleCardGradient: {
    padding: 20,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  moduleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  moduleSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  // 闯关记忆横幅
  memoryBanner: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  memoryBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  memoryBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  memoryBannerText: {
    gap: 2,
  },
  memoryBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memoryBannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  memoryBannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  memoryBannerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // 软卡片样式
  shadowDark: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  shadowLight: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowLight,
        shadowOffset: { width: -4, height: -4 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
      },
    }),
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
  },
  // 进度卡片
  progressCard: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.inset,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDetailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  progressDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  // 继续学习卡片
  continueCard: {
    marginBottom: 12,
    padding: 16,
  },
  continueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  continueChapter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  continueChapterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  continueInfo: {
    flex: 1,
  },
  continueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  continueProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueProgressBg: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.inset,
    borderRadius: 2,
    overflow: 'hidden',
  },
  continueProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  continueProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    minWidth: 36,
  },
  continuePlay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108,99,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 进度环相关
  progressRingBackground: {
    position: 'absolute',
  },
  progressRingCircle: {
    position: 'absolute',
  },
  progressRingForeground: {
    position: 'absolute',
  },
  progressCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});

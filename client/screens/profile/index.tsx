/**
 * 我的页面
 * 
 * 功能：
 * 1. 学习进度总览
 * 2. 收藏夹
 * 3. 错题本
 * 4. 设置
 */

import React from 'react';
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

// 学习统计数据
const STUDY_STATS = {
  totalDays: 15,
  theoryHours: 8.5,
  practiceHours: 4.2,
  examCount: 45,
  accuracy: 78,
};

// 菜单项
const MENU_ITEMS = [
  { id: 'favorites', title: '我的收藏', icon: '⭐', subtitle: '12条', color: COLORS.warning },
  { id: 'wrong', title: '错题本', icon: '❌', subtitle: '8条', color: COLORS.error },
  { id: 'history', title: '学习记录', icon: '📜', subtitle: '', color: COLORS.primary },
  { id: 'notes', title: '学习笔记', icon: '📝', subtitle: '5篇', color: COLORS.success },
];

const SETTINGS_ITEMS = [
  { id: 'notifications', title: '消息通知', icon: '🔔', showSwitch: true, value: true },
  { id: 'darkmode', title: '深色模式', icon: '🌙', showSwitch: true, value: false },
  { id: 'about', title: '关于我们', icon: 'ℹ️', showArrow: true },
  { id: 'feedback', title: '意见反馈', icon: '💬', showArrow: true },
];

// 图标组件
const Icon = ({ name, size = 20, color = '#6C63FF' }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, string> = {
    'star': '⭐',
    'trophy': '🏆',
    'fire': '🔥',
    'book': '📖',
    'setting': '⚙️',
    'logout': '🚪',
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

// 菜单项组件
const MenuItem = ({ item }: { item: typeof MENU_ITEMS[0] }) => (
  <TouchableOpacity activeOpacity={0.8} style={styles.menuItem}>
    <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
      <Text style={{ fontSize: 20 }}>{item.icon}</Text>
    </View>
    <Text style={styles.menuTitle}>{item.title}</Text>
    {item.subtitle && (
      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
    )}
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

// 设置项组件
const SettingItem = ({ item }: { item: typeof SETTINGS_ITEMS[0] }) => (
  <TouchableOpacity activeOpacity={0.8} style={styles.settingItem}>
    <View style={styles.settingLeft}>
      <Text style={{ fontSize: 20 }}>{item.icon}</Text>
      <Text style={styles.settingTitle}>{item.title}</Text>
    </View>
    {item.showArrow && <Text style={styles.menuArrow}>›</Text>}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();

  return (
    <Screen backgroundColor={COLORS.background} safeAreaEdges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 用户信息卡片 */}
        <View style={[styles.profileCard, { paddingTop: insets.top + 20 }]}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileGradient}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>李</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>李明华</Text>
                <View style={styles.userBadge}>
                  <Text style={styles.userBadgeText}>学习中</Text>
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.8} style={styles.editButton}>
                <Text style={styles.editButtonText}>编辑</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.studyDays}>
              <Icon name="fire" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.studyDaysText}>已连续学习 <Text style={styles.studyDaysNumber}>{STUDY_STATS.totalDays}</Text> 天</Text>
            </View>
          </LinearGradient>
        </View>

        {/* 学习统计 */}
        <View style={styles.statsContainer}>
          {[
            { label: '理论学习', value: `${STUDY_STATS.theoryHours}h`, icon: '📖', color: COLORS.primary },
            { label: '实操练习', value: `${STUDY_STATS.practiceHours}h`, icon: '🖼️', color: COLORS.secondary },
            { label: '刷题数量', value: `${STUDY_STATS.examCount}题`, icon: '✏️', color: COLORS.success },
            { label: '正确率', value: `${STUDY_STATS.accuracy}%`, icon: '🎯', color: COLORS.warning },
          ].map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                <Text style={{ fontSize: 18 }}>{stat.icon}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* 学习进度 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习进度</Text>
          <SoftCard style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>整体进度</Text>
                <Text style={styles.progressSubtitle}>第一章 - 第五章</Text>
              </View>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>42%</Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '42%' }]} />
            </View>
            <View style={styles.progressDetails}>
              <View style={styles.progressDetail}>
                <View style={[styles.progressDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.progressDetailLabel}>理论</Text>
                <Text style={styles.progressDetailValue}>67%</Text>
              </View>
              <View style={styles.progressDetail}>
                <View style={[styles.progressDot, { backgroundColor: COLORS.secondary }]} />
                <Text style={styles.progressDetailLabel}>实操</Text>
                <Text style={styles.progressDetailValue}>30%</Text>
              </View>
              <View style={styles.progressDetail}>
                <View style={[styles.progressDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.progressDetailLabel}>刷题</Text>
                <Text style={styles.progressDetailValue}>80%</Text>
              </View>
            </View>
          </SoftCard>
        </View>

        {/* 功能菜单 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>我的学习</Text>
          <SoftCard style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
              <React.Fragment key={item.id}>
                <MenuItem item={item} />
                {index < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
              </React.Fragment>
            ))}
          </SoftCard>
        </View>

        {/* 设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>设置</Text>
          <SoftCard style={styles.menuCard}>
            {SETTINGS_ITEMS.map((item, index) => (
              <React.Fragment key={item.id}>
                <SettingItem item={item} />
                {index < SETTINGS_ITEMS.length - 1 && <View style={styles.menuDivider} />}
              </React.Fragment>
            ))}
          </SoftCard>
        </View>

        {/* 退出登录 */}
        <TouchableOpacity activeOpacity={0.8} style={styles.logoutButton}>
          <Icon name="logout" size={18} color={COLORS.error} />
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
  },
  // Profile Card
  profileCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  profileGradient: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  userBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  userBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studyDays: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studyDaysText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  studyDaysNumber: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statItem: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  // Progress Card
  progressCard: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressBadge: {
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  progressBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.inset,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
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
  progressDetail: {
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
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  // Menu Card
  menuCard: {
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.textPlaceholder,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.inset,
    marginLeft: 68,
  },
  // Setting
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 14,
  },
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
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

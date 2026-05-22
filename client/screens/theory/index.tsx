/**
 * 理论学习页面
 * 
 * 功能：
 * 1. 章节列表
 * 2. 视频教学
 * 3. PPT课件预览
 * 4. 学习进度跟踪
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
  FlatList,
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
const CHAPTERS = [
  {
    id: 1,
    title: '第一章',
    subtitle: '养老护理基础理论',
    lessons: 12,
    completedLessons: 8,
    videos: 5,
    duration: '2小时30分',
    progress: 67,
    locked: false,
    icon: '📚',
  },
  {
    id: 2,
    title: '第二章',
    subtitle: '生活照料基本技能',
    lessons: 15,
    completedLessons: 0,
    videos: 8,
    duration: '3小时15分',
    progress: 0,
    locked: false,
    icon: '🛏️',
  },
  {
    id: 3,
    title: '第三章',
    subtitle: '基础护理技术',
    lessons: 18,
    completedLessons: 0,
    videos: 10,
    duration: '4小时',
    progress: 0,
    locked: true,
    icon: '💉',
  },
  {
    id: 4,
    title: '第四章',
    subtitle: '康复护理与心理护理',
    lessons: 14,
    completedLessons: 0,
    videos: 7,
    duration: '3小时',
    progress: 0,
    locked: true,
    icon: '🧠',
  },
  {
    id: 5,
    title: '第五章',
    subtitle: '老年常见疾病护理',
    lessons: 16,
    completedLessons: 0,
    videos: 9,
    duration: '3小时45分',
    progress: 0,
    locked: true,
    icon: '🏥',
  },
];

// 视频列表数据
const VIDEOS = [
  {
    id: 1,
    title: '养老护理员职业道德规范',
    duration: '15:30',
    watched: true,
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
  },
  {
    id: 2,
    title: '老年人生理特点与心理需求',
    duration: '22:45',
    watched: true,
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
  },
  {
    id: 3,
    title: '养老护理安全防护知识',
    duration: '18:20',
    watched: false,
    thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
  },
];

// 图标组件
const Icon = ({ name, size = 20, color = '#6C63FF' }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, string> = {
    'play': '▶️',
    'lock': '🔒',
    'check': '✓',
    'video': '🎬',
    'ppt': '📑',
    'book': '📖',
    'clock': '⏰',
    'star': '⭐',
    'back': '←',
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

// 章节卡片组件
const ChapterCard = ({ chapter, onPress }: { chapter: typeof CHAPTERS[0]; onPress: () => void }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={onPress}
    disabled={chapter.locked}
    style={styles.chapterCardWrapper}
  >
    <View style={[styles.chapterCard, chapter.locked && styles.chapterCardLocked]}>
      <View style={styles.chapterLeft}>
        <View style={[styles.chapterIcon, { backgroundColor: chapter.locked ? COLORS.inset : 'rgba(108,99,255,0.12)' }]}>
          <Text style={{ fontSize: 24 }}>{chapter.icon}</Text>
        </View>
        <View style={styles.chapterInfo}>
          <View style={styles.chapterTitleRow}>
            <Text style={[styles.chapterTitle, chapter.locked && styles.textLocked]}>{chapter.title}</Text>
            {chapter.locked && (
              <View style={styles.lockBadge}>
                <Icon name="lock" size={12} color={COLORS.textSecondary} />
              </View>
            )}
          </View>
          <Text style={[styles.chapterSubtitle, chapter.locked && styles.textLocked]}>{chapter.subtitle}</Text>
          <View style={styles.chapterMeta}>
            <View style={styles.chapterMetaItem}>
              <Icon name="video" size={12} color={COLORS.textSecondary} />
              <Text style={styles.chapterMetaText}>{chapter.videos}个视频</Text>
            </View>
            <View style={styles.chapterMetaItem}>
              <Icon name="clock" size={12} color={COLORS.textSecondary} />
              <Text style={styles.chapterMetaText}>{chapter.duration}</Text>
            </View>
          </View>
        </View>
      </View>
      {!chapter.locked && (
        <View style={styles.chapterRight}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{chapter.progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${chapter.progress}%` }]} />
          </View>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// 视频卡片组件
const VideoCard = ({ video, onPress }: { video: typeof VIDEOS[0]; onPress: () => void }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.videoCardWrapper}>
    <View style={styles.videoThumbnail}>
      <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnailImage} />
      <View style={styles.videoOverlay}>
        <View style={styles.playButton}>
          <Icon name="play" size={16} color="#FFFFFF" />
        </View>
      </View>
      <View style={styles.videoDuration}>
        <Text style={styles.videoDurationText}>{video.duration}</Text>
      </View>
      {video.watched && (
        <View style={styles.watchedBadge}>
          <Icon name="check" size={12} color="#FFFFFF" />
        </View>
      )}
    </View>
    <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
  </TouchableOpacity>
);

export default function TheoryScreen() {
  const router = useSafeRouter();
  const [selectedTab, setSelectedTab] = useState<'chapters' | 'videos'>('chapters');

  const renderTab = (tab: 'chapters' | 'videos', label: string) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setSelectedTab(tab)}
      style={[styles.tab, selectedTab === tab && styles.tabActive]}
    >
      <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{label}</Text>
      {selectedTab === tab && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>理论学习</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 顶部Banner */}
      <View style={styles.banner}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerTitle}>理论知识</Text>
              <Text style={styles.bannerSubtitle}>系统学习，全面掌握</Text>
              <View style={styles.bannerStats}>
                <View style={styles.bannerStat}>
                  <Text style={styles.bannerStatNumber}>5</Text>
                  <Text style={styles.bannerStatLabel}>章节</Text>
                </View>
                <View style={styles.bannerDivider} />
                <View style={styles.bannerStat}>
                  <Text style={styles.bannerStatNumber}>75</Text>
                  <Text style={styles.bannerStatLabel}>视频</Text>
                </View>
                <View style={styles.bannerDivider} />
                <View style={styles.bannerStat}>
                  <Text style={styles.bannerStatNumber}>16</Text>
                  <Text style={styles.bannerStatLabel}>小时</Text>
                </View>
              </View>
            </View>
            <View style={styles.bannerIcon}>
              <Icon name="book" size={48} color="rgba(255,255,255,0.3)" />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Tab切换 */}
      <View style={styles.tabContainer}>
        {renderTab('chapters', '章节学习')}
        {renderTab('videos', '视频课程')}
      </View>

      {/* 内容区域 */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedTab === 'chapters' ? (
          <View style={styles.chapterList}>
            {CHAPTERS.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                onPress={() => router.push('/chapter')}
              />
            ))}
          </View>
        ) : (
          <View style={styles.videoList}>
            {VIDEOS.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPress={() => {}}
              />
            ))}
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
      ios: {
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  // Banner
  banner: {
    marginHorizontal: 20,
    marginBottom: 20,
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
  bannerGradient: {
    padding: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerLeft: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  bannerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerStat: {
    alignItems: 'center',
  },
  bannerStatNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  bannerDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  bannerIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.card,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  // Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  chapterList: {
    gap: 12,
  },
  chapterCardWrapper: {
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
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  chapterCardLocked: {
    opacity: 0.7,
  },
  chapterLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  chapterIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  lockBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.inset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  chapterMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  chapterMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chapterMetaText: {
    fontSize: 11,
    color: COLORS.textPlaceholder,
  },
  chapterRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  progressContainer: {
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarBg: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.inset,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  textLocked: {
    color: COLORS.textPlaceholder,
  },
  // Video List
  videoList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  videoCardWrapper: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
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
  videoThumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  videoThumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.inset,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108,99,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoDurationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  watchedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    padding: 12,
    lineHeight: 18,
  },
  // Shadow styles
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
});

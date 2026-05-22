/**
 * 闯关记忆页面
 * 
 * 功能：
 * 1. 关卡列表 - 按章节划分关卡
 * 2. 记忆卡片 - 翻转式记忆学习
 * 3. 闯关挑战 - 限时答题
 * 4. 成就展示 - 学习成就徽章
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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

// 关卡数据
const LEVELS = [
  {
    id: 1,
    title: '第一章',
    subtitle: '职业道德与基础概念',
    levels: 5,
    completed: 3,
    stars: 3,
    locked: false,
  },
  {
    id: 2,
    title: '第二章',
    subtitle: '生活照料技能',
    levels: 6,
    completed: 0,
    stars: 0,
    locked: false,
  },
  {
    id: 3,
    title: '第三章',
    subtitle: '基础护理技术',
    levels: 8,
    completed: 0,
    stars: 0,
    locked: true,
  },
  {
    id: 4,
    title: '第四章',
    subtitle: '康复与心理护理',
    levels: 5,
    completed: 0,
    stars: 0,
    locked: true,
  },
  {
    id: 5,
    title: '第五章',
    subtitle: '急救技能',
    levels: 6,
    completed: 0,
    stars: 0,
    locked: true,
  },
];

// 记忆卡片数据
const MEMORY_CARDS = [
  { id: 1, front: '养老护理员', back: '从事老年人生活照料、护理服务工作的人员' },
  { id: 2, front: '一级护理', back: '病情危重、生活完全不能自理的患者' },
  { id: 3, front: '二级护理', back: '病情重、生活不能自理的患者' },
  { id: 4, front: '三级护理', back: '病情稳定、生活能自理的患者' },
  { id: 5, front: '噎食', back: '食物堵塞咽喉部或误入气管的现象' },
  { id: 6, front: '压疮', back: '局部组织长期受压，发生持续缺血、缺氧而溃烂' },
  { id: 7, front: '鼻饲', back: '通过鼻腔插入胃管进行管饲的方法' },
  { id: 8, front: '导尿术', back: '将导尿管插入膀胱引出尿液的技术' },
];

// 成就数据
const ACHIEVEMENTS = [
  { id: 1, title: '初出茅庐', description: '完成第一章所有关卡', icon: '🌱', unlocked: true },
  { id: 2, title: '学习达人', description: '累计学习30天', icon: '📚', unlocked: true },
  { id: 3, title: '记忆大师', description: '连续答对20道记忆题', icon: '🧠', unlocked: false },
  { id: 4, title: '全科状元', description: '所有章节达到三星', icon: '🏆', unlocked: false },
];

// 图标组件
const Icon = ({ name, size = 20, color = '#6C63FF' }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, string> = {
    'back': '←',
    'star': '⭐',
    'lock': '🔒',
    'check': '✓',
    'game': '🎮',
    'card': '🃏',
    'trophy': '🏆',
    'play': '▶️',
    'close': '✕',
    'fire': '🔥',
    'clock': '⏰',
    'gem': '💎',
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

// 关卡卡片组件
const LevelCard = ({ level, onPress }: { level: typeof LEVELS[0]; onPress: () => void }) => {
  const progress = level.completed / level.levels;
  
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={level.locked}
      style={styles.levelCardWrapper}
    >
      <View style={[styles.levelCard, level.locked && styles.levelCardLocked]}>
        <View style={styles.levelLeft}>
          <View style={[styles.levelIcon, { backgroundColor: level.locked ? COLORS.inset : 'rgba(108,99,255,0.12)' }]}>
            {level.locked ? (
              <Icon name="lock" size={22} color={COLORS.textPlaceholder} />
            ) : (
              <Text style={styles.levelIconText}>{level.id}</Text>
            )}
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelTitle, level.locked && styles.textLocked]}>{level.title}</Text>
            <Text style={[styles.levelSubtitle, level.locked && styles.textLocked]}>{level.subtitle}</Text>
            {!level.locked && (
              <View style={styles.levelProgress}>
                <View style={styles.levelProgressBar}>
                  <View style={[styles.levelProgressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.levelProgressText}>{level.completed}/{level.levels}</Text>
              </View>
            )}
          </View>
        </View>
        {!level.locked && (
          <View style={styles.levelRight}>
            <View style={styles.starsContainer}>
              {[1, 2, 3].map((star) => (
                <Icon
                  key={star}
                  name="star"
                  size={16}
                  color={star <= level.stars ? COLORS.warning : COLORS.inset}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// 记忆卡片组件
const FlashCard = ({ card, isFlipped, onFlip }: { 
  card: typeof MEMORY_CARDS[0]; 
  isFlipped: boolean; 
  onFlip: () => void;
}) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onFlip} style={styles.flashCardWrapper}>
    <View style={[styles.flashCard, isFlipped && styles.flashCardFlipped]}>
      <View style={styles.flashCardInner}>
        {!isFlipped ? (
          <View style={styles.flashCardFront}>
            <Text style={styles.flashCardLabel}>术语</Text>
            <Text style={styles.flashCardText}>{card.front}</Text>
            <Text style={styles.flashCardHint}>点击翻转查看答案</Text>
          </View>
        ) : (
          <View style={styles.flashCardBack}>
            <Text style={styles.flashCardLabel}>释义</Text>
            <Text style={styles.flashCardText}>{card.back}</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// 成就卡片组件
const AchievementCard = ({ achievement }: { achievement: typeof ACHIEVEMENTS[0] }) => (
  <View style={styles.achievementCard}>
    <View style={[styles.achievementIcon, !achievement.unlocked && styles.achievementIconLocked]}>
      <Text style={[styles.achievementEmoji, !achievement.unlocked && styles.achievementEmojiLocked]}>
        {achievement.icon}
      </Text>
    </View>
    <Text style={[styles.achievementTitle, !achievement.unlocked && styles.textLocked]}>
      {achievement.title}
    </Text>
    <Text style={styles.achievementDesc}>{achievement.description}</Text>
    {achievement.unlocked ? (
      <View style={[styles.achievementBadge, { backgroundColor: COLORS.success }]}>
        <Icon name="check" size={10} color="#FFFFFF" />
      </View>
    ) : (
      <View style={[styles.achievementBadge, { backgroundColor: COLORS.inset }]}>
        <Icon name="lock" size={10} color={COLORS.textPlaceholder} />
      </View>
    )}
  </View>
);

export default function MemoryScreen() {
  const router = useSafeRouter();
  const [activeTab, setActiveTab] = useState<'levels' | 'cards' | 'achievements'>('levels');
  const [practiceModalVisible, setPracticeModalVisible] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<number[]>([]);
  const [unknownCards, setUnknownCards] = useState<number[]>([]);

  const handleStartPractice = () => {
    setPracticeModalVisible(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setKnownCards([]);
    setUnknownCards([]);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    const currentCard = MEMORY_CARDS[currentCardIndex];
    if (!isFlipped) {
      // 未翻转时点击下一题，先标记为unknown
      setUnknownCards([...unknownCards, currentCard.id]);
    }
    
    if (currentCardIndex < MEMORY_CARDS.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      // 全部完成
      setPracticeModalVisible(false);
    }
  };

  const handleKnow = () => {
    const currentCard = MEMORY_CARDS[currentCardIndex];
    setKnownCards([...knownCards, currentCard.id]);
    handleNext();
  };

  const currentCard = MEMORY_CARDS[currentCardIndex];

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
        <Text style={styles.headerTitle}>闯关记忆</Text>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleStartPractice}
          style={styles.startButton}
        >
          <Icon name="play" size={18} color={COLORS.primary} />
        </TouchableOpacity>
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
              <Text style={styles.bannerTitle}>游戏化学习</Text>
              <Text style={styles.bannerSubtitle}>闯关记忆，记得更牢</Text>
              <View style={styles.bannerStats}>
                <View style={styles.bannerStat}>
                  <Icon name="gem" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.bannerStatText}>15</Text>
                </View>
                <View style={styles.bannerStat}>
                  <Icon name="fire" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.bannerStatText}>3天连续</Text>
                </View>
              </View>
            </View>
            <View style={styles.bannerIcon}>
              <Icon name="game" size={48} color="rgba(255,255,255,0.3)" />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Tab切换 */}
      <View style={styles.tabContainer}>
        {([
          { key: 'levels', label: '关卡', icon: '🏰' },
          { key: 'cards', label: '记忆卡', icon: '🃏' },
          { key: 'achievements', label: '成就', icon: '🏆' },
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
        {activeTab === 'levels' && (
          <View style={styles.levelList}>
            {LEVELS.map((level) => (
              <LevelCard
                key={level.id}
                level={level}
                onPress={() => {}}
              />
            ))}
          </View>
        )}

        {activeTab === 'cards' && (
          <View style={styles.cardsContainer}>
            <View style={styles.cardsHeader}>
              <Text style={styles.cardsTitle}>术语记忆卡片</Text>
              <Text style={styles.cardsCount}>{MEMORY_CARDS.length}张</Text>
            </View>
            <View style={styles.cardsGrid}>
              {MEMORY_CARDS.map((card, index) => (
                <FlashCard
                  key={card.id}
                  card={card}
                  isFlipped={false}
                  onFlip={() => {}}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'achievements' && (
          <View style={styles.achievementsContainer}>
            <SoftCard style={styles.achievementSummary}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryTitle}>我的成就</Text>
                <Text style={styles.summarySubtitle}>
                  {ACHIEVEMENTS.filter(a => a.unlocked).length}/{ACHIEVEMENTS.length} 已解锁
                </Text>
              </View>
              <View style={styles.summaryRight}>
                <Icon name="trophy" size={32} color={COLORS.warning} />
              </View>
            </SoftCard>
            <View style={styles.achievementsGrid}>
              {ACHIEVEMENTS.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </View>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 记忆卡片练习Modal */}
      <Modal
        visible={practiceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPracticeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Icon name="card" size={20} color={COLORS.primary} />
                <Text style={styles.modalTitle}>记忆练习</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setPracticeModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* 进度 */}
            <View style={styles.practiceProgress}>
              <View style={styles.practiceProgressBar}>
                <View style={[styles.practiceProgressFill, { width: `${((currentCardIndex + 1) / MEMORY_CARDS.length) * 100}%` }]} />
              </View>
              <Text style={styles.practiceProgressText}>{currentCardIndex + 1}/{MEMORY_CARDS.length}</Text>
            </View>

            {/* 卡片区域 */}
            <View style={styles.cardArea}>
              <FlashCard
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={handleFlip}
              />
              
              {!isFlipped ? (
                <Text style={styles.tapHint}>点击卡片翻转查看答案</Text>
              ) : (
                <View style={styles.resultButtons}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleNext}
                    style={[styles.resultButton, styles.unknownButton]}
                  >
                    <Text style={styles.resultButtonText}>不认识</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleKnow}
                    style={[styles.resultButton, styles.knownButton]}
                  >
                    <Text style={styles.resultButtonText}>记住了</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 统计 */}
            <View style={styles.practiceStats}>
              <View style={styles.practiceStatItem}>
                <View style={[styles.practiceStatDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.practiceStatText}>认识: {knownCards.length}</Text>
              </View>
              <View style={styles.practiceStatItem}>
                <View style={[styles.practiceStatDot, { backgroundColor: COLORS.error }]} />
                <Text style={styles.practiceStatText}>不认识: {unknownCards.length}</Text>
              </View>
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
  startButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108,99,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Banner
  banner: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  bannerGradient: { padding: 20 },
  bannerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerLeft: { flex: 1 },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  bannerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  bannerStats: { flexDirection: 'row', gap: 16 },
  bannerStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bannerStatText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
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
  tab: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10, 
    borderRadius: 10,
  },
  tabIcon: { fontSize: 16 },
  tabActive: {
    backgroundColor: COLORS.card,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary },
  tabIndicator: { position: 'absolute', bottom: 0, width: 20, height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  // Content
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  // Level List
  levelList: { gap: 12 },
  levelCardWrapper: {
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  levelCardLocked: { opacity: 0.7 },
  levelLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  levelIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelIconText: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  levelSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  levelProgress: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  levelProgressBar: { flex: 1, height: 4, backgroundColor: COLORS.inset, borderRadius: 2, overflow: 'hidden' },
  levelProgressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  levelProgressText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  levelRight: { alignItems: 'flex-end' },
  starsContainer: { flexDirection: 'row', gap: 4 },
  textLocked: { color: COLORS.textPlaceholder },
  // Cards
  cardsContainer: { paddingTop: 8 },
  cardsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardsTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  cardsCount: { fontSize: 13, color: COLORS.textSecondary },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  flashCardWrapper: {
    width: (SCREEN_WIDTH - 40 - 12) / 2 - 6,
  },
  flashCard: {
    aspectRatio: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  flashCardFlipped: {
    backgroundColor: COLORS.primary,
  },
  flashCardInner: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  flashCardFront: { alignItems: 'center' },
  flashCardBack: { alignItems: 'center' },
  flashCardLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  flashCardText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  flashCardHint: { fontSize: 11, color: COLORS.textPlaceholder, marginTop: 12 },
  // Achievements
  achievementsContainer: { gap: 16 },
  achievementSummary: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  summaryLeft: { flex: 1 },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  summarySubtitle: { fontSize: 13, color: COLORS.textSecondary },
  summaryRight: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(253,203,110,0.15)', justifyContent: 'center', alignItems: 'center' },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  achievementCard: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: COLORS.shadowDark, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(253,203,110,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementIconLocked: { backgroundColor: COLORS.inset },
  achievementEmoji: { fontSize: 28 },
  achievementEmojiLocked: { opacity: 0.5 },
  achievementTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  achievementDesc: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 8 },
  achievementBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 34 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.inset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  practiceProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  practiceProgressBar: { flex: 1, height: 8, backgroundColor: COLORS.inset, borderRadius: 4, overflow: 'hidden' },
  practiceProgressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  practiceProgressText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  cardArea: { paddingHorizontal: 20, alignItems: 'center' },
  tapHint: { fontSize: 13, color: COLORS.textPlaceholder, marginTop: 20 },
  resultButtons: { flexDirection: 'row', gap: 16, marginTop: 20 },
  resultButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  unknownButton: { backgroundColor: COLORS.inset },
  knownButton: { backgroundColor: COLORS.success },
  resultButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  practiceStats: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 20, paddingHorizontal: 20 },
  practiceStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  practiceStatDot: { width: 8, height: 8, borderRadius: 4 },
  practiceStatText: { fontSize: 13, color: COLORS.textSecondary },
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

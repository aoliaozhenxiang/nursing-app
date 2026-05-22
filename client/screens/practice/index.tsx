/**
 * 实操练习页面
 * 
 * 功能：
 * 1. 操作图片展示
 * 2. 用户上传对比评判
 * 3. 标准操作视频
 * 4. 步骤分解学习
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import * as ImagePicker from 'expo-image-picker';

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

// 操作技能数据
const SKILLS = [
  {
    id: 1,
    title: '床上翻身护理',
    category: '基础护理',
    difficulty: '基础',
    steps: 5,
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
  },
  {
    id: 2,
    title: '口腔护理技术',
    category: '基础护理',
    difficulty: '基础',
    steps: 6,
    imageUrl: 'https://images.unsplash.com/photo-1584539696499-12a1d0c4e138?w=400',
  },
  {
    id: 3,
    title: '鼻饲管喂食',
    category: '基础护理',
    difficulty: '中级',
    steps: 8,
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
  },
  {
    id: 4,
    title: '导尿管护理',
    category: '基础护理',
    difficulty: '中级',
    steps: 7,
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
  },
  {
    id: 5,
    title: '噎食急救处理',
    category: '急救技能',
    difficulty: '高级',
    steps: 6,
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
  },
  {
    id: 6,
    title: '心肺复苏术',
    category: '急救技能',
    difficulty: '高级',
    steps: 8,
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400',
  },
];

// 难度颜色映射
const DIFFICULTY_COLORS: Record<string, string> = {
  '基础': COLORS.success,
  '中级': COLORS.warning,
  '高级': COLORS.error,
};

// 图标组件
const Icon = ({ name, size = 20, color = '#6C63FF' }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, string> = {
    'back': '←',
    'camera': '📷',
    'upload': '⬆️',
    'compare': '🔍',
    'check': '✓',
    'close': '✕',
    'play': '▶️',
    'star': '⭐',
    'tips': '💡',
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

// 技能卡片组件
const SkillCard = ({ skill, onPress }: { skill: typeof SKILLS[0]; onPress: () => void }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.skillCardWrapper}>
    <View style={styles.skillCard}>
      <View style={styles.skillImageContainer}>
        <Image source={{ uri: skill.imageUrl }} style={styles.skillImage} />
        <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[skill.difficulty] }]}>
          <Text style={styles.difficultyText}>{skill.difficulty}</Text>
        </View>
      </View>
      <View style={styles.skillInfo}>
        <Text style={styles.skillCategory}>{skill.category}</Text>
        <Text style={styles.skillTitle}>{skill.title}</Text>
        <View style={styles.skillMeta}>
          <Text style={styles.skillSteps}>{skill.steps}个步骤</Text>
          <View style={styles.practiceButton}>
            <Text style={styles.practiceButtonText}>练习</Text>
          </View>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function PracticeScreen() {
  const router = useSafeRouter();
  const [selectedSkill, setSelectedSkill] = useState<typeof SKILLS[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'basic' | 'emergency'>('all');

  // 请求相机权限
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  };

  // 拍照上传
  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('权限不足', '请在设置中开启相机和相册权限');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUserImage(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  // 从相册选择
  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('权限不足', '请在设置中开启相册权限');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUserImage(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  const handleSkillPress = (skill: typeof SKILLS[0]) => {
    setSelectedSkill(skill);
  };

  const filteredSkills = activeTab === 'all' 
    ? SKILLS 
    : activeTab === 'basic'
      ? SKILLS.filter(s => s.category === '基础护理')
      : SKILLS.filter(s => s.category === '急救技能');

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
        <Text style={styles.headerTitle}>实操练习</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 顶部Banner */}
      <View style={styles.banner}>
        <LinearGradient
          colors={[COLORS.secondary, '#FF8FA3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerTitle}>实操技能训练</Text>
              <Text style={styles.bannerSubtitle}>图片对比，快速提升</Text>
              <View style={styles.bannerStats}>
                <View style={styles.bannerStat}>
                  <Text style={styles.bannerStatNumber}>6</Text>
                  <Text style={styles.bannerStatLabel}>技能</Text>
                </View>
                <View style={styles.bannerDivider} />
                <View style={styles.bannerStat}>
                  <Text style={styles.bannerStatNumber}>40</Text>
                  <Text style={styles.bannerStatLabel}>步骤</Text>
                </View>
              </View>
            </View>
            <View style={styles.bannerIcon}>
              <Text style={{ fontSize: 48 }}>🖼️</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Tab切换 */}
      <View style={styles.tabContainer}>
        {(['all', 'basic', 'emergency'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.8}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'all' ? '全部' : tab === 'basic' ? '基础护理' : '急救技能'}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* 功能入口 */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={handleTakePhoto}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryEnd]}
            style={styles.actionGradient}
          >
            <Icon name="camera" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>拍照上传练习</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={handlePickImage}
          style={styles.actionButton}
        >
          <View style={[styles.actionGradient, { backgroundColor: COLORS.secondary }]}>
            <Icon name="upload" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>相册选择</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 技能列表 */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.skillGrid}>
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onPress={() => handleSkillPress(skill)}
            />
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 图片对比Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>图片对比评判</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.compareContainer}>
                <View style={styles.compareColumn}>
                  <Text style={styles.compareLabel}>标准图</Text>
                  <View style={styles.compareImageWrapper}>
                    {selectedSkill && (
                      <Image 
                        source={{ uri: selectedSkill.imageUrl }} 
                        style={styles.compareImage}
                      />
                    )}
                  </View>
                </View>
                <View style={styles.compareColumn}>
                  <Text style={styles.compareLabel}>你的练习图</Text>
                  <View style={styles.compareImageWrapper}>
                    {userImage ? (
                      <Image source={{ uri: userImage }} style={styles.compareImage} />
                    ) : (
                      <View style={styles.comparePlaceholder}>
                        <Text style={styles.comparePlaceholderText}>请上传图片</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* 评判结果 */}
              <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                  <Icon name="tips" size={20} color={COLORS.primary} />
                  <Text style={styles.resultTitle}>评判要点</Text>
                </View>
                <View style={styles.resultList}>
                  <View style={styles.resultItem}>
                    <View style={[styles.resultDot, { backgroundColor: COLORS.success }]} />
                    <Text style={styles.resultText}>操作姿势是否标准</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <View style={[styles.resultDot, { backgroundColor: COLORS.success }]} />
                    <Text style={styles.resultText}>与长者的沟通是否到位</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <View style={[styles.resultDot, { backgroundColor: COLORS.warning }]} />
                    <Text style={styles.resultText}>操作细节是否规范</Text>
                  </View>
                </View>
              </View>

              {/* 操作建议 */}
              <SoftCard style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Icon name="star" size={18} color={COLORS.warning} />
                  <Text style={styles.suggestionTitle}>提升建议</Text>
                </View>
                <Text style={styles.suggestionText}>
                  建议观看标准操作视频，仔细观察每个步骤的动作要领，特别是手部位置和力度控制。
                </Text>
                <TouchableOpacity activeOpacity={0.8} style={styles.watchButton}>
                  <Icon name="play" size={14} color="#FFFFFF" />
                  <Text style={styles.watchButtonText}>观看标准视频</Text>
                </TouchableOpacity>
              </SoftCard>
            </ScrollView>
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
      ios: {
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerRight: { width: 40 },
  // Banner
  banner: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
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
      ios: {
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.secondary },
  tabIndicator: { position: 'absolute', bottom: 0, width: 20, height: 3, backgroundColor: COLORS.secondary, borderRadius: 2 },
  // Action Buttons
  actionContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  actionText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  // Content
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  skillCardWrapper: {
    width: '48%',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  skillCard: { backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden' },
  skillImageContainer: { position: 'relative' },
  skillImage: { width: '100%', aspectRatio: 4 / 3, backgroundColor: COLORS.inset },
  difficultyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF' },
  skillInfo: { padding: 12 },
  skillCategory: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  skillTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  skillMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillSteps: { fontSize: 12, color: COLORS.textSecondary },
  practiceButton: {
    backgroundColor: 'rgba(255,101,132,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  practiceButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.secondary },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inset,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.inset,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareContainer: { flexDirection: 'row', padding: 20, gap: 12 },
  compareColumn: { flex: 1 },
  compareLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, textAlign: 'center' },
  compareImageWrapper: {
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.inset,
  },
  compareImage: { width: '100%', height: '100%' },
  comparePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  comparePlaceholderText: { fontSize: 14, color: COLORS.textPlaceholder },
  resultContainer: { marginHorizontal: 20, marginBottom: 16 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  resultTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  resultList: { gap: 10 },
  resultItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultDot: { width: 8, height: 8, borderRadius: 4 },
  resultText: { fontSize: 13, color: COLORS.textSecondary },
  suggestionCard: { marginHorizontal: 20, padding: 16 },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  suggestionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  suggestionText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 14 },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  watchButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  // Shadow styles
  shadowDark: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
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
  card: { backgroundColor: COLORS.card, borderRadius: 20 },
});

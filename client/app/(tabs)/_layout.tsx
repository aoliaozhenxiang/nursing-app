/**
 * Tab 导航布局
 * 
 * 底部导航栏，包含5个Tab：
 * 1. 首页 (home)
 * 2. 理论学习 (theory)
 * 3. 实操练习 (practice)
 * 4. 刷题 (exam)
 * 5. 我的 (profile)
 */

import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCSSVariable } from 'uniwind';

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
  textSecondary: '#B2BEC3',
};

// Tab图标组件
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    'home': '🏠',
    'theory': '📖',
    'practice': '🖼️',
    'exam': '✏️',
    'profile': '👤',
  };
  return (
    <>{icons[name]}</>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [background, muted, accent] = useCSSVariable([
    '--color-background',
    '--color-muted',
    '--color-accent',
  ]) as string[];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 12,
          height: Platform.OS === 'ios' ? 85 : 70,
          shadowColor: COLORS.shadowDark,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="theory"
        options={{
          title: '理论学',
          tabBarIcon: ({ focused }) => <TabIcon name="theory" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: '实操练',
          tabBarIcon: ({ focused }) => <TabIcon name="practice" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="exam"
        options={{
          title: '考题考',
          tabBarIcon: ({ focused }) => <TabIcon name="exam" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

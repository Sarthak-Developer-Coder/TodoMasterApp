/**
 * navigation/TaskNavigator.tsx
 * Bottom-tab + native-stack navigator for the authenticated experience.
 *
 * Tab bar:  Home  |  + (FAB)  |  Profile
 * Stack:    Home → AddTask (create / edit) → TaskDetail
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Radius, Shadows, Spacing } from '../theme';
import { TaskStackParamList } from '../types';

import HomeScreen from '../screens/tasks/HomeScreen';
import AddTaskScreen from '../screens/tasks/AddTaskScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import ProfileScreen from '../screens/tasks/ProfileScreen';

// ─────────────────────────────────────────────
//  Custom Tab Bar with floating FAB centre button
// ─────────────────────────────────────────────

/**
 * Custom bottom tab bar rendering:
 *   [Home icon]  [  ⊕ FAB  ]  [Profile icon]
 * The FAB navigates to AddTask screen.
 */
const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation: tabNav }) => {
  const stackNav = useNavigation<NativeStackNavigationProp<TaskStackParamList>>();

  return (
    <View style={tabStyles.container}>
      {/* Home */}
      <TouchableOpacity
        style={tabStyles.tab}
        onPress={() => tabNav.navigate('HomeTab')}
        activeOpacity={0.7}>
        <View style={[tabStyles.icon, state.index === 0 && tabStyles.iconActive]}>
          <View style={[tabStyles.dot, state.index === 0 && tabStyles.dotActive]} />
          {/* Home icon (unicode house) */}
        </View>
        {/* Icon label */}
      </TouchableOpacity>

      {/* FAB — AddTask */}
      <TouchableOpacity
        style={tabStyles.fab}
        onPress={() => stackNav.navigate('AddTask', {})}
        activeOpacity={0.85}>
        <View style={tabStyles.fabInner}>
          {/* Plus sign drawn with two rectangles */}
          <View style={tabStyles.plusH} />
          <View style={tabStyles.plusV} />
        </View>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        style={tabStyles.tab}
        onPress={() => tabNav.navigate('ProfileTab')}
        activeOpacity={0.7}>
        <View style={[tabStyles.icon, state.index === 1 && tabStyles.iconActive]}>
          <View style={[tabStyles.dot, state.index === 1 && tabStyles.dotActive]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    height: 70,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
    ...Shadows.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: `${Colors.primary}22`,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 10,
    height: 10,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Shadows.glow,
  },
  fabInner: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusH: {
    position: 'absolute',
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.white,
  },
  plusV: {
    position: 'absolute',
    width: 3,
    height: 24,
    borderRadius: 2,
    backgroundColor: Colors.white,
  },
});

// ─────────────────────────────────────────────
//  Bottom Tab Navigator
// ─────────────────────────────────────────────
type TabParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}>
    <Tab.Screen name="HomeTab" component={HomeScreen} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} />
  </Tab.Navigator>
);

// ─────────────────────────────────────────────
//  Stack Navigator (wraps tabs + modals)
// ─────────────────────────────────────────────
const Stack = createNativeStackNavigator<TaskStackParamList>();

const TaskNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background },
    }}>
    <Stack.Screen name="Home" component={TabNavigator} />
    <Stack.Screen
      name="AddTask"
      component={AddTaskScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      name="TaskDetail"
      component={TaskDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </Stack.Navigator>
);

export default TaskNavigator;

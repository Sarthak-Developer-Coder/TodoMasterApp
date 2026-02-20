/**
 * navigation/AppNavigator.tsx
 * Root navigator — switches between the Auth flow and the Main app
 * based on the Redux authentication state.
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, ActivityIndicator, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { restoreSession } from '../store/authSlice';
import { Colors } from '../theme';
import { RootStackParamList } from '../types';

import AuthNavigator from './AuthNavigator';
import TaskNavigator from './TaskNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);

  // Attempt to restore a persisted session when the app first mounts
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Show a full-screen loader while the session is being restored
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor={Colors.background}
        barStyle="light-content"
        translucent={false}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={TaskNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

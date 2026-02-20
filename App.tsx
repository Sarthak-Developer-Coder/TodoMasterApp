/**
 * App.tsx — Root application component.
 *
 * Sets up:
 *   1. Redux store with Persist gate (shows spinner until hydration is complete)
 *   2. GestureHandlerRootView (required by react-native-gesture-handler)
 *   3. SafeAreaProvider (required by react-native-safe-area-context)
 *   4. Toast notifications provider
 *   5. AppNavigator (handles auth ← → task routing)
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

import { store, persistor } from './src/store';
import { Colors } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Shown while redux-persist rehydrates state from AsyncStorage.
 * Usually only visible for a few milliseconds on app start.
 */
const PersistLoading = () => (
  <View style={styles.loader}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

const App: React.FC = () => (
  <GestureHandlerRootView style={styles.root}>
    <SafeAreaProvider>
      {/* Redux store provider */}
      <Provider store={store}>
        {/* Delays rendering until persisted state is loaded */}
        <PersistGate loading={<PersistLoading />} persistor={persistor}>
          <AppNavigator />
          {/* Global toast notifications (accessible app-wide via Toast.show()) */}
          <Toast />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;

/**
 * components/LoadingOverlay.tsx
 * Full-screen semi-transparent loading overlay with spinner and optional message.
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

interface Props {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<Props> = ({ visible, message }) => (
  <Modal transparent animationType="fade" visible={visible}>
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={Colors.primary} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    minWidth: 140,
    ...Shadows.lg,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default LoadingOverlay;

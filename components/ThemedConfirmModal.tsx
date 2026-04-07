import { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  BackHandler,
} from 'react-native';
import { colors, spacing, radius, fonts, shadows } from '../constants/theme';

interface ThemedConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ThemedConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ThemedConfirmModalProps) {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onCancel();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [visible, onCancel]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.95);
      opacity.setValue(0);
    }
  }, [visible, scale, opacity]);

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdropContainer}>
        <Pressable style={styles.backdropPress} onPress={onCancel}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.45],
                }),
              },
            ]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonsRow}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  card: {
    width: '84%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    minWidth: 110,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  primaryText: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.textDark,
  },
  secondaryText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textDark,
  },
});

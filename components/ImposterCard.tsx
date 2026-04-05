import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fonts, shadows } from '../constants/theme';
import type { HintDifficulty } from '../types';

const AUTO_BLUR_DELAY = 10000; // 10 seconds

interface ImposterCardProps {
  hint: string;
  difficulty: HintDifficulty;
  playerName: string;
  onDismiss: () => void;
}

export default function ImposterCard({
  hint,
  difficulty,
  playerName,
  onDismiss,
}: ImposterCardProps) {
  const flipProgress = useRef(new Animated.Value(0)).current;
  const blurOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Start flip animation on mount
    Animated.timing(flipProgress, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Auto-blur after 10 seconds
    blurTimerRef.current = setTimeout(() => {
      Animated.timing(blurOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, AUTO_BLUR_DELAY);

    return () => {
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  const rotateY = flipProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '0deg'],
  });

  const cardOpacity = flipProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onDismiss();
  };

  const handleTapToReveal = () => {
    // Check if blurred by looking at current value
    blurOpacity.stopAnimation((value) => {
      if (value > 0) {
        Animated.timing(blurOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
        
        // Re-set the auto-blur timer
        if (blurTimerRef.current) {
          clearTimeout(blurTimerRef.current);
        }
        blurTimerRef.current = setTimeout(() => {
          Animated.timing(blurOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, AUTO_BLUR_DELAY);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.forPlayer}>This is for {playerName} only 👁️</Text>

      <Pressable onPress={handleTapToReveal} style={styles.cardWrapper}>
        <Animated.View style={[
          styles.card,
          {
            transform: [
              { perspective: 1000 },
              { rotateY },
            ],
            opacity: cardOpacity,
          }
        ]}>
          {/* Role label */}
          <Text style={styles.roleLabel}>You are the Imposter 🕵️</Text>

          {/* Hint word */}
          <Text style={styles.hint}>{hint}</Text>

          {/* Hint label */}
          <Text style={styles.hintLabel}>Your hint</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Note */}
          <Text style={styles.note}>Don't get caught.</Text>

          {/* Blur overlay */}
          <Animated.View 
            style={[styles.blurOverlay, { opacity: blurOpacity }]} 
            pointerEvents="none"
          >
            <Text style={styles.blurText}>Tap to peek</Text>
          </Animated.View>
        </Animated.View>
      </Pressable>

      {/* Dismiss button */}
      <Pressable onPress={handleDismiss}>
        <Animated.View style={[
          styles.dismissButton,
          { transform: [{ scale: buttonScale }] }
        ]}>
          <Text style={styles.dismissText}>I've Seen It — Cover Screen</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  forPlayer: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 320,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
    overflow: 'hidden',
  },
  roleLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  hint: {
    fontFamily: fonts.heading,
    fontSize: 48,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  hintLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: spacing.md,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 238, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  blurText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
  },
  dismissButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
  },
  dismissText: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.textDark,
  },
});

import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
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
  const flipProgress = useSharedValue(0);
  const blurOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Start flip animation on mount
    flipProgress.value = withTiming(1, { duration: 600 });

    // Auto-blur after 10 seconds
    const timer = setTimeout(() => {
      blurOpacity.value = withTiming(1, { duration: 500 });
    }, AUTO_BLUR_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const cardStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipProgress.value,
      [0, 1],
      [90, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity: interpolate(flipProgress.value, [0, 0.5, 1], [0, 0.5, 1]),
    };
  });

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    onDismiss();
  };

  const handleTapToReveal = () => {
    if (blurOpacity.value > 0) {
      blurOpacity.value = withTiming(0, { duration: 300 });
      // Re-set the auto-blur timer
      setTimeout(() => {
        blurOpacity.value = withTiming(1, { duration: 500 });
      }, AUTO_BLUR_DELAY);
    }
  };

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'easy':
        return 'Easy Hint';
      case 'medium':
        return 'Medium Hint';
      case 'spicy':
        return 'Spicy Hint 🌶️';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.forPlayer}>This is for {playerName} only 👁️</Text>

      <Pressable onPress={handleTapToReveal} style={styles.cardWrapper}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Role label */}
          <Text style={styles.roleLabel}>IMPOSTER 🕵️</Text>

          {/* Hint text */}
          <Text style={styles.hint}>{hint}</Text>

          {/* Difficulty label */}
          <Text style={styles.difficulty}>{getDifficultyLabel()}</Text>

          {/* Note */}
          <Text style={styles.note}>Bluff. Don't get caught.</Text>

          {/* Blur overlay */}
          <Animated.View style={[styles.blurOverlay, blurStyle]} pointerEvents="none">
            <Text style={styles.blurText}>Tap to peek</Text>
          </Animated.View>
        </Animated.View>
      </Pressable>

      {/* Dismiss button */}
      <Pressable onPress={handleDismiss}>
        <Animated.View style={[styles.dismissButton, buttonAnimatedStyle]}>
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
    backgroundColor: colors.danger,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
    overflow: 'hidden',
  },
  roleLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.textLight,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
  hint: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 40,
  },
  difficulty: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255, 248, 238, 0.7)',
    marginBottom: spacing.xl,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255, 248, 238, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(192, 57, 43, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  blurText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textLight,
  },
  dismissButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.textLight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
  },
  dismissText: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.danger,
  },
});

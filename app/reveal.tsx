import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fonts, radius } from '../constants/theme';
import {
  useGameStore,
  usePlayers,
  useImposterIndex,
  useCurrentWord,
} from '../store/gameStore';
import RevealAnimation from '../components/RevealAnimation';

export default function RevealScreen() {
  const players = usePlayers();
  const imposterIndex = useImposterIndex();
  const currentWord = useCurrentWord();
  const resetGame = useGameStore((state) => state.resetGame);

  const [animationComplete, setAnimationComplete] = useState(false);

  // Button animations
  const buttonsOpacity = useSharedValue(0);

  const handleAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
    buttonsOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
  }, []);

  const handlePlayAgain = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetGame();
    router.replace('/setup');
  }, [resetGame]);

  const handleBackToHome = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  }, []);

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  // Safety check
  if (imposterIndex === null || !currentWord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Pressable style={styles.errorButton} onPress={handleBackToHome}>
            <Text style={styles.errorButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>The Moment of Truth</Text>
        </View>

        {/* Reveal Animation */}
        <View style={styles.animationContainer}>
          <RevealAnimation
            players={players}
            imposterIndex={imposterIndex}
            secretWord={currentWord.word}
            onAnimationComplete={handleAnimationComplete}
          />
        </View>

        {/* Action Buttons */}
        {animationComplete && (
          <Animated.View style={[styles.actions, buttonsStyle]}>
            <Pressable
              style={({ pressed }) => [
                styles.playAgainButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handlePlayAgain}
            >
              <Text style={styles.playAgainText}>Play Again 🎉</Text>
            </Pressable>

            <Pressable
              style={styles.homeLink}
              onPress={handleBackToHome}
            >
              <Text style={styles.homeLinkText}>Back to Home</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.primary,
    textAlign: 'center',
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  playAgainButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  playAgainText: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textDark,
  },
  homeLink: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  homeLinkText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  errorButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
  },
  errorButtonText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.textDark,
  },
});

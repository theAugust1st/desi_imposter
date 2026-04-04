import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ScreenCapture from 'expo-screen-capture';
import { colors, spacing, fonts, radius, shadows } from '../constants/theme';
import { useGameStore, usePlayers, useFirstPlayerIndex } from '../store/gameStore';
import PlayerAvatar from '../components/PlayerAvatar';
import PeekButton from '../components/PeekButton';

const SLOT_DURATION = 2500; // Total animation time in ms
const SLOT_INTERVAL = 80; // Start interval between name changes

export default function DiscussionScreen() {
  const players = usePlayers();
  const firstPlayerIndex = useFirstPlayerIndex();
  const goToReveal = useGameStore((state) => state.goToReveal);

  const [slotIndex, setSlotIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [showResult, setShowResult] = useState(false);

  // Animation values
  const titleScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const slotScale = useSharedValue(1);
  const resultOpacity = useSharedValue(0);
  const resultScale = useSharedValue(0.8);
  const buttonOpacity = useSharedValue(0);

  // Release screen capture on discussion screen
  useEffect(() => {
    ScreenCapture.allowScreenCaptureAsync();
    return () => {
      // Re-enable protection when leaving
    };
  }, []);

  // Slot machine animation
  useEffect(() => {
    if (!isSpinning || firstPlayerIndex === null) return;

    let interval = SLOT_INTERVAL;
    let elapsed = 0;
    let timeoutId: NodeJS.Timeout;

    const spin = () => {
      // Exponential slowdown as we approach the end
      const progress = elapsed / SLOT_DURATION;
      interval = SLOT_INTERVAL + progress * progress * 300;
      elapsed += interval;

      if (elapsed >= SLOT_DURATION) {
        // Final landing - land on the predetermined first player
        setSlotIndex(firstPlayerIndex);
        setIsSpinning(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Show result with animation
        setTimeout(() => {
          setShowResult(true);
          resultOpacity.value = withTiming(1, { duration: 400 });
          resultScale.value = withSpring(1, { damping: 12 });
          buttonOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
        }, 300);
      } else {
        // Keep spinning through random players
        setSlotIndex((prev) => (prev + 1) % players.length);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        slotScale.value = withSequence(
          withTiming(1.05, { duration: 30 }),
          withTiming(1, { duration: 50 })
        );
        timeoutId = setTimeout(spin, interval);
      }
    };

    timeoutId = setTimeout(spin, interval);

    return () => clearTimeout(timeoutId);
  }, [isSpinning, firstPlayerIndex, players.length]);

  // Intro animation
  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 500 });
    titleScale.value = withSpring(1, { damping: 12 });
  }, []);

  const handleReveal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    goToReveal();
    router.push('/reveal');
  }, [goToReveal]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const slotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: slotScale.value }],
  }));

  const resultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ scale: resultScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const currentPlayer = players[slotIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Animated.View style={[styles.header, titleStyle]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Time to Play!</Text>
          <Text style={styles.subtitle}>Discuss and find the imposter</Text>
        </Animated.View>

        {/* Slot Machine */}
        <View style={styles.slotContainer}>
          <Text style={styles.slotLabel}>
            {isSpinning ? 'Picking who goes first...' : 'First to speak:'}
          </Text>

          <Animated.View style={[styles.slotCard, slotStyle]}>
            {currentPlayer && (
              <>
                <PlayerAvatar
                  name={currentPlayer.name}
                  index={slotIndex}
                  size="large"
                />
                <Text style={styles.playerName}>{currentPlayer.name}</Text>
              </>
            )}
          </Animated.View>

          {showResult && (
            <Animated.Text style={[styles.goesFirst, resultStyle]}>
              goes first! 🎤
            </Animated.Text>
          )}
        </View>

        {/* Actions */}
        {showResult && (
          <Animated.View style={[styles.actions, buttonStyle]}>
            {/* Peek Button */}
            <PeekButton />

            {/* Reveal Imposter Button */}
            <Pressable
              style={({ pressed }) => [
                styles.revealButton,
                pressed && styles.revealButtonPressed,
              ]}
              onPress={handleReveal}
            >
              <Text style={styles.revealButtonText}>Reveal Imposter 🕵️</Text>
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
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  slotContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  slotLabel: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  slotCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 200,
    ...shadows.card,
  },
  playerName: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.textDark,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  goesFirst: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.accent,
    marginTop: spacing.lg,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  revealButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  revealButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  revealButtonText: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textLight,
  },
});

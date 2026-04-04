import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  withRepeat,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fonts, radius, shadows } from '../constants/theme';
import type { Player } from '../types';
import PlayerAvatar, { getAvatarColor } from './PlayerAvatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RevealAnimationProps {
  players: Player[];
  imposterIndex: number;
  secretWord: string;
  onAnimationComplete: () => void;
}

export default function RevealAnimation({
  players,
  imposterIndex,
  secretWord,
  onAnimationComplete,
}: RevealAnimationProps) {
  // Animation values for each card
  const cardAnimations = players.map(() => ({
    rotateY: useSharedValue(180), // Start face-down
    scale: useSharedValue(0.8),
    translateX: useSharedValue(0),
    translateY: useSharedValue(0),
    shake: useSharedValue(0),
    opacity: useSharedValue(1),
  }));

  // Imposter reveal animation values
  const imposterScale = useSharedValue(1);
  const imposterGlow = useSharedValue(0);

  // Word reveal animation
  const wordOpacity = useSharedValue(0);
  const wordScale = useSharedValue(0.8);

  useEffect(() => {
    const runAnimation = async () => {
      // Phase 1: Shake all cards (0-1s)
      cardAnimations.forEach((anim) => {
        anim.shake.value = withRepeat(
          withSequence(
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(0, { duration: 50 })
          ),
          3,
          false
        );
      });

      // Haptic feedback during shake
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, i * 250);
      }

      // Phase 2: Scatter cards (1-1.5s)
      setTimeout(() => {
        cardAnimations.forEach((anim, index) => {
          if (index !== imposterIndex) {
            const angle = (index / players.length) * Math.PI * 2;
            const distance = 150;
            anim.translateX.value = withTiming(Math.cos(angle) * distance, {
              duration: 500,
              easing: Easing.out(Easing.cubic),
            });
            anim.translateY.value = withTiming(Math.sin(angle) * distance, {
              duration: 500,
              easing: Easing.out(Easing.cubic),
            });
            anim.opacity.value = withTiming(0.3, { duration: 500 });
            anim.scale.value = withTiming(0.6, { duration: 500 });
          }
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 1000);

      // Phase 3: Flip imposter card (1.5-2.5s)
      setTimeout(() => {
        const imposterAnim = cardAnimations[imposterIndex];
        imposterAnim.rotateY.value = withTiming(0, {
          duration: 800,
          easing: Easing.inOut(Easing.cubic),
        });
        imposterAnim.scale.value = withSpring(1.2, { damping: 10 });
        imposterScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 500 }),
            withTiming(1, { duration: 500 })
          ),
          -1,
          true
        );
        imposterGlow.value = withTiming(1, { duration: 500 });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }, 1500);

      // Phase 4: Show secret word (3.5s)
      setTimeout(() => {
        wordOpacity.value = withTiming(1, { duration: 500 });
        wordScale.value = withSpring(1, { damping: 12 });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onAnimationComplete();
      }, 3500);
    };

    runAnimation();
  }, []);

  const imposterPlayer = players[imposterIndex];

  const imposterPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imposterScale.value }],
  }));

  const wordRevealStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ scale: wordScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Card Grid */}
      <View style={styles.cardGrid}>
        {players.map((player, index) => {
          const anim = cardAnimations[index];
          const isImposter = index === imposterIndex;

          const cardStyle = useAnimatedStyle(() => ({
            opacity: anim.opacity.value,
            transform: [
              { translateX: anim.translateX.value + anim.shake.value },
              { translateY: anim.translateY.value },
              { scale: anim.scale.value },
              { perspective: 1000 },
              {
                rotateY: `${anim.rotateY.value}deg`,
              },
            ],
          }));

          const backStyle = useAnimatedStyle(() => ({
            opacity: interpolate(
              anim.rotateY.value,
              [90, 180],
              [0, 1],
              Extrapolation.CLAMP
            ),
          }));

          const frontStyle = useAnimatedStyle(() => ({
            opacity: interpolate(
              anim.rotateY.value,
              [0, 90],
              [1, 0],
              Extrapolation.CLAMP
            ),
          }));

          return (
            <Animated.View
              key={player.id}
              style={[
                styles.cardWrapper,
                isImposter && styles.imposterCardWrapper,
                cardStyle,
              ]}
            >
              {/* Card Back (face down) */}
              <Animated.View style={[styles.cardBack, backStyle]}>
                <Text style={styles.cardBackText}>?</Text>
              </Animated.View>

              {/* Card Front (face up - only for imposter) */}
              {isImposter && (
                <Animated.View
                  style={[styles.cardFront, styles.imposterFront, frontStyle]}
                >
                  <Animated.View style={imposterPulseStyle}>
                    <Text style={styles.imposterLabel}>THE IMPOSTER</Text>
                    <PlayerAvatar
                      name={imposterPlayer.name}
                      index={imposterIndex}
                      size="large"
                    />
                    <Text style={styles.imposterName}>
                      {imposterPlayer.name}
                    </Text>
                  </Animated.View>
                </Animated.View>
              )}
            </Animated.View>
          );
        })}
      </View>

      {/* Secret Word Reveal */}
      <Animated.View style={[styles.wordReveal, wordRevealStyle]}>
        <Text style={styles.wordLabel}>The secret word was:</Text>
        <Text style={styles.secretWord}>{secretWord}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH - spacing.lg * 2,
    gap: spacing.sm,
  },
  cardWrapper: {
    width: 80,
    height: 100,
    position: 'relative',
  },
  imposterCardWrapper: {
    width: 140,
    height: 180,
    zIndex: 10,
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    ...shadows.card,
  },
  cardBackText: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.textLight,
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    ...shadows.card,
  },
  imposterFront: {
    backgroundColor: colors.danger,
    padding: spacing.md,
  },
  imposterLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.textLight,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  imposterName: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textLight,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  wordReveal: {
    position: 'absolute',
    bottom: spacing.xxl,
    alignItems: 'center',
  },
  wordLabel: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  secretWord: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.primary,
  },
});

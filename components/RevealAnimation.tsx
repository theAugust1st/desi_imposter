import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fonts, radius, shadows } from '../constants/theme';
import type { Player } from '../types';
import PlayerAvatar from './PlayerAvatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RevealAnimationProps {
  players: Player[];
  imposterIndex: number;
  secretWord: string;
  onAnimationComplete: () => void;
}

interface CardAnimation {
  rotateY: Animated.Value;
  scale: Animated.Value;
  translateX: Animated.Value;
  translateY: Animated.Value;
  shake: Animated.Value;
  opacity: Animated.Value;
}

export default function RevealAnimation({
  players,
  imposterIndex,
  secretWord,
  onAnimationComplete,
}: RevealAnimationProps) {
  // Animation values for each card
  const cardAnimationsRef = useRef<CardAnimation[]>(
    players.map(() => ({
      rotateY: new Animated.Value(180), // Start face-down
      scale: new Animated.Value(0.8),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      shake: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  );

  // Imposter pulse animation
  const imposterScale = useRef(new Animated.Value(1)).current;

  // Word reveal animation
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const cardAnimations = cardAnimationsRef.current;

    // Phase 1: Shake all cards (0-1s)
    const shakeAnimations = cardAnimations.map((anim) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.shake, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(anim.shake, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(anim.shake, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(anim.shake, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(anim.shake, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      )
    );
    
    Animated.parallel(shakeAnimations).start();

    // Haptic feedback during shake
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, i * 250);
    }

    // Phase 2: Scatter cards (1-1.5s)
    setTimeout(() => {
      const scatterAnimations: Animated.CompositeAnimation[] = [];
      
      cardAnimations.forEach((anim, index) => {
        if (index !== imposterIndex) {
          const angle = (index / players.length) * Math.PI * 2;
          const distance = 150;
          
          scatterAnimations.push(
            Animated.parallel([
              Animated.timing(anim.translateX, {
                toValue: Math.cos(angle) * distance,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateY, {
                toValue: Math.sin(angle) * distance,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.3,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 0.6,
                duration: 500,
                useNativeDriver: true,
              }),
            ])
          );
        }
      });
      
      Animated.parallel(scatterAnimations).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 1000);

    // Phase 3: Flip imposter card (1.5-2.5s)
    setTimeout(() => {
      const imposterAnim = cardAnimations[imposterIndex];
      
      Animated.parallel([
        Animated.timing(imposterAnim.rotateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(imposterAnim.scale, {
          toValue: 1.2,
          damping: 10,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(imposterScale, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(imposterScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }, 1500);

    // Phase 4: Show secret word (3.5s)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(wordScale, {
          toValue: 1,
          damping: 12,
          useNativeDriver: true,
        }),
      ]).start();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onAnimationComplete();
    }, 3500);
  }, []);

  const cardAnimations = cardAnimationsRef.current;
  const imposterPlayer = players[imposterIndex];

  return (
    <View style={styles.container}>
      {/* Card Grid */}
      <View style={styles.cardGrid}>
        {players.map((player, index) => {
          const anim = cardAnimations[index];
          const isImposter = index === imposterIndex;

          const rotateYInterpolate = anim.rotateY.interpolate({
            inputRange: [0, 180],
            outputRange: ['0deg', '180deg'],
          });

          const backOpacity = anim.rotateY.interpolate({
            inputRange: [0, 90, 180],
            outputRange: [0, 0, 1],
            extrapolate: 'clamp',
          });

          const frontOpacity = anim.rotateY.interpolate({
            inputRange: [0, 90, 180],
            outputRange: [1, 0, 0],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={player.id}
              style={[
                styles.cardWrapper,
                isImposter && styles.imposterCardWrapper,
                {
                  opacity: anim.opacity,
                  transform: [
                    { translateX: Animated.add(anim.translateX, anim.shake) },
                    { translateY: anim.translateY },
                    { scale: anim.scale },
                    { perspective: 1000 },
                    { rotateY: rotateYInterpolate },
                  ],
                },
              ]}
            >
              {/* Card Back (face down) */}
              <Animated.View style={[styles.cardBack, { opacity: backOpacity }]}>
                <Text style={styles.cardBackText}>?</Text>
              </Animated.View>

              {/* Card Front (face up - only for imposter) */}
              {isImposter && (
                <Animated.View
                  style={[styles.cardFront, styles.imposterFront, { opacity: frontOpacity }]}
                >
                  <Animated.View style={{ transform: [{ scale: imposterScale }] }}>
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
      <Animated.View style={[
        styles.wordReveal,
        {
          opacity: wordOpacity,
          transform: [{ scale: wordScale }],
        }
      ]}>
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

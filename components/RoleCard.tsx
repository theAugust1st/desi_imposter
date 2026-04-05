import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fonts, shadows } from '../constants/theme';
import { getRegionLabel, SHARED_LABEL } from '../constants/regions';
import type { WordEntry } from '../types';

const AUTO_BLUR_DELAY = 10000; // 10 seconds

interface RoleCardProps {
  word: WordEntry;
  playerName: string;
  onDismiss: () => void;
}

export default function RoleCard({ word, playerName, onDismiss }: RoleCardProps) {
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

  // Get the origin label
  const getOriginLabel = () => {
    if (word.scope === 'shared') {
      return SHARED_LABEL;
    }
    // For local words, use the first region
    if (word.regions.length > 0) {
      return getRegionLabel(word.regions[0]);
    }
    return SHARED_LABEL;
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
          <Text style={styles.roleLabel}>VILLAGER</Text>

          {/* Secret word */}
          <Text
            style={styles.word}
            adjustsFontSizeToFit={true}
            numberOfLines={1}
          >
            {word.word}
          </Text>

          {/* Origin label */}
          <Text style={styles.origin}>{getOriginLabel()}</Text>

          {/* Note */}
          <Text style={styles.note}>Remember this. Don't say it out loud.</Text>

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
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
  word: {
    fontFamily: fonts.heading,
    fontSize: 56,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  origin: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
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

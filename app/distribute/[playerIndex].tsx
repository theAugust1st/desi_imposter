import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, PanResponder, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fonts, shadows } from '../../constants/theme';
import { useGameStore } from '../../store/gameStore';
import { getRegionLabel, SHARED_LABEL } from '../../constants/regions';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const REVEAL_THRESHOLD = 40;
const SNAP_UP_POSITION = -SCREEN_HEIGHT;

export default function DistributeScreen() {
  const { players, currentWord, config } = useGameStore();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Card 1 Y position only
  const card1TranslateY = useRef(new Animated.Value(0)).current;

  const currentPlayer = players[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === players.length - 1;
  const isImposter = currentPlayer?.isImposter;

  // Prevent screen capture
  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync();
    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);

  // Reset when player changes
  useEffect(() => {
    card1TranslateY.setValue(0);
    setIsRevealed(false);
  }, [currentPlayerIndex]);

  // PanResponder for Card 1 drag
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isRevealed,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isRevealed && gestureState.dy < -5;
      },
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow upward movement (negative dy)
        if (gestureState.dy < 0) {
          card1TranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -REVEAL_THRESHOLD) {
          // Threshold met - show button immediately, snap card back
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setIsRevealed(true);
          
          // Spring card back down to original position
          Animated.spring(card1TranslateY, {
            toValue: 0,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }).start();
        } else {
          // Snap back down (not enough drag)
          Animated.spring(card1TranslateY, {
            toValue: 0,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleNextPerson = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Reset Card 1 position instantly
    card1TranslateY.setValue(0);
    
    if (isLastPlayer) {
      router.push('/discussion');
    } else {
      setCurrentPlayerIndex((prev) => prev + 1);
    }
  };

  // Safety check
  if (!currentPlayer || !currentWord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Game state error. Please restart.</Text>
          <Pressable onPress={() => router.replace('/')}>
            <Text style={styles.errorLink}>Go Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Get origin label for villager
  const getOriginLabel = () => {
    if (currentWord.scope === 'shared') {
      return SHARED_LABEL;
    }
    if (currentWord.regions.length > 0) {
      return getRegionLabel(currentWord.regions[0]);
    }
    return SHARED_LABEL;
  };

  // Get initials from player name
  const getInitials = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return '?';
    const parts = trimmed.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Static header text */}
      <Text style={styles.passPhoneText}>Pass the phone 👋</Text>

      {/* Cards container - centered on screen */}
      <View style={styles.cardsContainer}>
        {/* Card 2 (BOTTOM) - Role content, static, always there */}
        <View style={styles.card2}>
          {isImposter ? (
            <>
              <Text style={styles.imposterLabel}>
                You are the <Text style={styles.imposterHighlight}>Imposter</Text> 🕵️
              </Text>
              <Text
                style={styles.hintWord}
                adjustsFontSizeToFit={true}
                numberOfLines={1}
              >
                {currentWord.hints[config.hintDifficulty]}
              </Text>
              <Text style={styles.hintLabel}>Your hint</Text>
              <Text style={styles.imposterNote}>Don't get caught.</Text>
            </>
          ) : (
            <>
              <Text style={styles.villagerLabel}>VILLAGER</Text>
              <Text
                style={styles.villagerWord}
                adjustsFontSizeToFit={true}
                numberOfLines={1}
              >
                {currentWord.word}
              </Text>
              <Text style={styles.villagerOrigin}>{getOriginLabel()}</Text>
            </>
          )}
        </View>

        {/* Card 1 (TOP) - Player name card, slides up */}
        <Animated.View
          style={[
            styles.card1,
            { transform: [{ translateY: card1TranslateY }] },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{getInitials(currentPlayer.name)}</Text>
          </View>
          <Text style={styles.playerName}>{currentPlayer.name}</Text>
          <View style={styles.divider} />
          <Text style={styles.arrowIcon}>↑</Text>
          <Text style={styles.slideHint}>Slide up to reveal</Text>
        </Animated.View>
      </View>

      {/* Next Person Button - appears instantly when spring completes */}
      {isRevealed && (
        <View style={styles.buttonWrapper}>
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
            onPress={handleNextPerson}
          >
            <Text style={styles.nextButtonText}>
              {isLastPlayer ? 'Start Discussion →' : 'Next Person →'}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8EE',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorLink: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.primary,
  },

  // Static header
  passPhoneText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  // Cards container - centers both cards
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  // Card 2 (BOTTOM) - Role card, static
  card2: {
    position: 'absolute',
    width: '90%',
    height: 280,
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 5,
    ...shadows.card,
  },

  // Card 1 (TOP) - Player card, slides up
  card1: {
    position: 'absolute',
    width: '90%',
    height: 280,
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadows.card,
  },

  // Card 1 content
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarInitials: {
    fontFamily: fonts.label,
    fontSize: 24,
    color: colors.textDark,
  },
  playerName: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginBottom: spacing.lg,
  },
  arrowIcon: {
    fontSize: 32,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  slideHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Card 2 content - Villager
  villagerLabel: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  villagerWord: {
    fontFamily: fonts.heading,
    fontSize: 48,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  villagerOrigin: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },

  // Card 2 content - Imposter
  imposterLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  imposterHighlight: {
    fontFamily: fonts.label,
    color: colors.danger,
  },
  hintWord: {
    fontFamily: fonts.heading,
    fontSize: 42,
    color: '#2C2C2C',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  hintLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  imposterNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textMuted,
  },

  // Button wrapper
  buttonWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
  },
  nextButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  nextButtonText: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textDark,
  },
});

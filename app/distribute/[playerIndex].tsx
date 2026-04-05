import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, PanResponder, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fonts, shadows } from '../../constants/theme';
import { useGameStore } from '../../store/gameStore';
import PlayerAvatar from '../../components/PlayerAvatar';
import { getRegionLabel, SHARED_LABEL } from '../../constants/regions';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const PANEL_SLIDE_THRESHOLD = 100; // Distance to swipe before revealing

export default function DistributeScreen() {
  const { players, currentWord, config } = useGameStore();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Panel animation
  const panelY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const currentPlayer = players[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === players.length - 1;
  const isImposter = currentPlayer?.isImposter;

  // Prevent screen capture throughout the distribution flow
  useEffect(() => {
    const preventCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync();
    };
    preventCapture();

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);

  // Reset panel position when player changes
  useEffect(() => {
    panelY.setValue(SCREEN_HEIGHT);
    setIsRevealed(false);
  }, [currentPlayerIndex]);

  // PanResponder for swipe up gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isRevealed,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isRevealed && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isRevealed && gestureState.dy < 0) {
          // Only allow upward movement
          panelY.setValue(SCREEN_HEIGHT + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isRevealed && gestureState.dy < -PANEL_SLIDE_THRESHOLD) {
          // Swipe up threshold met - reveal
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.spring(panelY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
          }).start(() => {
            setIsRevealed(true);
          });
        } else {
          // Snap back down
          Animated.spring(panelY, {
            toValue: SCREEN_HEIGHT,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleNextPerson = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Slide panel down
    Animated.spring(panelY, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
    }).start(() => {
      if (isLastPlayer) {
        // Navigate to discussion
        router.replace('/discussion');
      } else {
        // Move to next player
        setCurrentPlayerIndex((prev) => prev + 1);
      }
    });
  };

  // Safety check
  if (!currentPlayer || !currentWord) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Game state error. Please restart.</Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.errorLink}>Go Home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Get role content
  const getRoleContent = () => {
    if (isImposter) {
      const hint = currentWord.hints[config.hintDifficulty];
      return {
        role: 'IMPOSTER 🕵️',
        content: hint,
        backgroundColor: colors.danger,
        textColor: colors.textLight,
        note: 'Bluff. Don\'t get caught.',
      };
    } else {
      const originLabel = currentWord.scope === 'shared' 
        ? SHARED_LABEL 
        : getRegionLabel(currentWord.regions[0]);
      
      return {
        role: 'VILLAGER',
        content: currentWord.word,
        backgroundColor: colors.surface,
        textColor: colors.textDark,
        note: 'Remember this. Don\'t say it out loud.',
        origin: originLabel,
      };
    }
  };

  const roleContent = getRoleContent();

  return (
    <SafeAreaView style={styles.container}>
      {/* Cover Screen */}
      <View style={styles.coverContainer}>
        <View style={styles.coverContent}>
          <PlayerAvatar 
            name={currentPlayer.name} 
            index={currentPlayerIndex} 
            size="large" 
          />
          <Text style={styles.playerTurnText}>{currentPlayer.name}'s turn</Text>
          <Text style={styles.instructionText}>⬆️ Slide up to reveal your role</Text>
        </View>
      </View>

      {/* Slide-up Panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            backgroundColor: roleContent.backgroundColor,
            transform: [{ translateY: panelY }],
          },
        ]}
        {...(!isRevealed ? panResponder.panHandlers : {})}
      >
        {/* Swipe Indicator */}
        {!isRevealed && (
          <View style={styles.swipeIndicator}>
            <View style={styles.swipeHandle} />
          </View>
        )}

        {/* Role Content */}
        <View style={styles.roleContent}>
          <Text style={[styles.roleLabel, { color: roleContent.textColor }]}>
            {roleContent.role}
          </Text>
          
          <Text style={[styles.roleMain, { color: roleContent.textColor }]}>
            {roleContent.content}
          </Text>

          {roleContent.origin && (
            <Text style={[styles.roleOrigin, { color: roleContent.textColor }]}>
              {roleContent.origin}
            </Text>
          )}

          <Text style={[styles.roleNote, { color: roleContent.textColor }]}>
            {roleContent.note}
          </Text>

          {isRevealed && (
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
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.coverBg,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
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
  coverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContent: {
    alignItems: 'center',
  },
  playerTurnText: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.textLight,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  instructionText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadows.card,
  },
  swipeIndicator: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  swipeHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  roleContent: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
  roleMain: {
    fontFamily: fonts.heading,
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  roleOrigin: {
    fontFamily: fonts.body,
    fontSize: 14,
    opacity: 0.8,
    marginBottom: spacing.xl,
  },
  roleNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.xxl,
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    marginTop: spacing.xl,
  },
  nextButtonPressed: {
    opacity: 0.8,
  },
  nextButtonText: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textLight,
  },
});

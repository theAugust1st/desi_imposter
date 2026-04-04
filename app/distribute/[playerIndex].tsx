import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { colors, spacing, radius, fonts } from '../../constants/theme';
import { useGameStore } from '../../store/gameStore';
import CoverScreen from '../../components/CoverScreen';
import RoleCard from '../../components/RoleCard';
import ImposterCard from '../../components/ImposterCard';
import PlayerAvatar from '../../components/PlayerAvatar';

type DistributionPhase = 'cover' | 'confirm' | 'reveal';

export default function DistributeScreen() {
  const { playerIndex: playerIndexParam } = useLocalSearchParams<{ playerIndex: string }>();
  const playerIndex = parseInt(playerIndexParam ?? '0', 10);

  const { players, currentWord, config, nextPlayer } = useGameStore();

  const [phase, setPhase] = useState<DistributionPhase>('cover');
  const buttonScale = useSharedValue(1);

  const currentPlayer = players[playerIndex];
  const isLastPlayer = playerIndex === players.length - 1;

  // Prevent screen capture throughout the distribution flow
  useEffect(() => {
    const preventCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync();
    };
    preventCapture();

    return () => {
      // Only allow capture after leaving distribution entirely
      if (isLastPlayer) {
        ScreenCapture.allowScreenCaptureAsync();
      }
    };
  }, [isLastPlayer]);

  // Handle hold-to-reveal completion
  const handleRevealStart = () => {
    setPhase('confirm');
  };

  // Handle confirmation - "Are you [Name]?"
  const handleConfirmYes = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('reveal');
  };

  const handleConfirmNo = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setPhase('cover');
  };

  // Handle dismiss from role card - go to next player or discussion
  const handleDismiss = () => {
    if (isLastPlayer) {
      // All players have seen their roles, go to discussion
      router.replace('/discussion');
    } else {
      // Move to next player
      nextPlayer();
      router.replace(`/distribute/${playerIndex + 1}`);
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1);
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

  // Render based on current phase
  if (phase === 'cover') {
    return (
      <CoverScreen
        playerName={currentPlayer.name}
        onReveal={handleRevealStart}
      />
    );
  }

  if (phase === 'confirm') {
    return (
      <SafeAreaView style={styles.confirmContainer}>
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.confirmContent}
        >
          <PlayerAvatar name={currentPlayer.name} index={playerIndex} size="large" />
          
          <Text style={styles.confirmQuestion}>Are you</Text>
          <Text style={styles.confirmName}>{currentPlayer.name}?</Text>

          <View style={styles.confirmButtons}>
            <Pressable
              onPress={handleConfirmYes}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
            >
              <Animated.View style={[styles.confirmButton, styles.confirmButtonYes, buttonAnimatedStyle]}>
                <Text style={styles.confirmButtonTextYes}>Yes, that's me</Text>
              </Animated.View>
            </Pressable>

            <Pressable
              onPress={handleConfirmNo}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
            >
              <Animated.View style={[styles.confirmButton, styles.confirmButtonNo, buttonAnimatedStyle]}>
                <Text style={styles.confirmButtonTextNo}>No, wrong person</Text>
              </Animated.View>
            </Pressable>
          </View>

          <Text style={styles.confirmHint}>
            Hand it to the right person!
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Phase: reveal
  if (currentPlayer.isImposter) {
    const hint = currentWord.hints[config.hintDifficulty];
    return (
      <ImposterCard
        hint={hint}
        difficulty={config.hintDifficulty}
        playerName={currentPlayer.name}
        onDismiss={handleDismiss}
      />
    );
  }

  return (
    <RoleCard
      word={currentWord}
      playerName={currentPlayer.name}
      onDismiss={handleDismiss}
    />
  );
}

const styles = StyleSheet.create({
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
  confirmContainer: {
    flex: 1,
    backgroundColor: colors.coverBg,
  },
  confirmContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  confirmQuestion: {
    fontFamily: fonts.body,
    fontSize: 24,
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  confirmName: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.textLight,
    marginBottom: spacing.xl,
  },
  confirmButtons: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.md,
  },
  confirmButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  confirmButtonYes: {
    backgroundColor: colors.primary,
  },
  confirmButtonNo: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  confirmButtonTextYes: {
    fontFamily: fonts.label,
    fontSize: 18,
    color: colors.textDark,
  },
  confirmButtonTextNo: {
    fontFamily: fonts.label,
    fontSize: 18,
    color: colors.textMuted,
  },
  confirmHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});

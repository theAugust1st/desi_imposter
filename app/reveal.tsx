import { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fonts, radius, shadows } from '../constants/theme';
import { useGameStore, usePlayers, useImposterIndex } from '../store/gameStore';
import PlayerAvatar from '../components/PlayerAvatar';

export default function RevealScreen() {
  const players = usePlayers();
  const imposterIndex = useImposterIndex();
  const playAgain = useGameStore((state) => state.playAgain);
  const navigation = useNavigation();
  const isNavigatingToSetupRef = useRef(false);
  const allowForwardNavRef = useRef(false);

  // Play Again - same players, new word, new imposter
  const handlePlayAgain = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await playAgain();
    allowForwardNavRef.current = true;
    router.replace('/distribute/0');
  }, [playAgain]);

  // Back to Setup - go to setup with players pre-filled (no store clearing)
  const handleBackToSetup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isNavigatingToSetupRef.current) {
      return;
    }

    isNavigatingToSetupRef.current = true;
    router.replace('/setup');
  }, []);

  useFocusEffect(
    useCallback(() => {
      allowForwardNavRef.current = false;

      const unsubscribe = navigation.addListener('beforeRemove', (event) => {
        if (isNavigatingToSetupRef.current) {
          return;
        }

        if (allowForwardNavRef.current) {
          return;
        }

        event.preventDefault();
        handleBackToSetup();
      });

      return unsubscribe;
    }, [handleBackToSetup, navigation])
  );

  // Safety check
  if (imposterIndex === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Pressable style={styles.errorButton} onPress={handleBackToSetup}>
            <Text style={styles.errorButtonText}>Back to Setup</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const imposter = players[imposterIndex];

  // Fallback if imposter is undefined (players array was cleared)
  if (!imposter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.headerText}>Game Over</Text>
          <Pressable style={styles.errorButton} onPress={() => router.replace('/')}>
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
          <Text style={styles.headerEmoji}>🕵️</Text>
          <Text style={styles.headerText}>The Imposter was...</Text>
        </View>

        {/* Imposter Card */}
        <View style={styles.imposterSection}>
          <View style={styles.imposterCard}>
            <PlayerAvatar
              name={imposter.name}
              index={imposterIndex}
              size="large"
            />
            <Text style={styles.imposterName}>{imposter.name}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {/* Play Again - same players, new word */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handlePlayAgain}
          >
            <Text style={styles.primaryButtonText}>Play Again 🔄</Text>
          </Pressable>

          {/* Back to Setup - edit players in setup */}
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleBackToSetup}
          >
            <Text style={styles.secondaryButtonText}>Back to Setup ⚙️</Text>
          </Pressable>
        </View>
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
    paddingTop: spacing.xxl,
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  headerText: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.textDark,
    textAlign: 'center',
  },
  imposterSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imposterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 220,
    ...shadows.card,
  },
  imposterName: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.textDark,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textDark,
  },
  secondaryButtonText: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textDark,
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

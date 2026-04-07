import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as ScreenCapture from 'expo-screen-capture';
import { colors, spacing, fonts, radius, shadows } from '../constants/theme';
import { useGameStore, usePlayers } from '../store/gameStore';
import PlayerAvatar from '../components/PlayerAvatar';
import PeekButton from '../components/PeekButton';
import ThemedConfirmModal from '../components/ThemedConfirmModal';

export default function DiscussionScreen() {
  const players = usePlayers();
  const goToReveal = useGameStore((state) => state.goToReveal);
  const navigation = useNavigation();
  const isNavigatingToSetupRef = useRef(false);
  const isExitPromptVisibleRef = useRef(false);
  const allowForwardNavRef = useRef(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Pick random player instantly on mount
  const randomPlayerIndex = useMemo(() => {
    return Math.floor(Math.random() * players.length);
  }, [players.length]);

  const randomPlayer = players[randomPlayerIndex];

  // Release screen capture on discussion screen
  useEffect(() => {
    ScreenCapture.allowScreenCaptureAsync();
  }, []);

  const handleReveal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    goToReveal();
    allowForwardNavRef.current = true;
    router.replace('/reveal');
  }, [goToReveal]);

  const goToSetup = useCallback(() => {
    if (isNavigatingToSetupRef.current) {
      return;
    }

    isNavigatingToSetupRef.current = true;
    router.replace('/setup');
  }, []);

  const showExitConfirmation = useCallback(() => {
    if (isExitPromptVisibleRef.current) {
      return;
    }
    isExitPromptVisibleRef.current = true;
    setConfirmVisible(true);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    isExitPromptVisibleRef.current = false;
    setConfirmVisible(false);
  }, []);

  const handleConfirmExit = useCallback(() => {
    isExitPromptVisibleRef.current = false;
    setConfirmVisible(false);
    goToSetup();
  }, [goToSetup]);

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
        showExitConfirmation();
      });

      return unsubscribe;
    }, [navigation, showExitConfirmation])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Time to Play!</Text>
          <Text style={styles.subtitle}>Discuss and find the imposter</Text>
        </View>

        {/* Random Player Card */}
        <View style={styles.playerSection}>
          <View style={styles.playerCard}>
            {randomPlayer && (
              <>
                <PlayerAvatar
                  name={randomPlayer.name}
                  index={randomPlayerIndex}
                  size="large"
                />
                <Text style={styles.playerName}>
                  🎯 {randomPlayer.name} first!
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
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
        </View>
      </View>

      <ConfirmModal
        visible={confirmVisible}
        onCancel={handleCancelConfirm}
        onConfirm={handleConfirmExit}
      />
    </SafeAreaView>
  );
}

const ConfirmModal = ({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <ThemedConfirmModal
    visible={visible}
    title="Leave game?"
    message="Go back to Setup?"
    cancelLabel="Cancel"
    confirmLabel="Back to Setup"
    onCancel={onCancel}
    onConfirm={onConfirm}
  />
);

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
  title: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  playerSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  playerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 200,
    ...shadows.card,
  },
  playerName: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.textDark,
    marginTop: spacing.md,
    textAlign: 'center',
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

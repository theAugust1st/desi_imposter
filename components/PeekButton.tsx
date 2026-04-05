import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fonts, radius, shadows } from '../constants/theme';
import {
  usePlayers,
  useCurrentWord,
  useConfig,
  useImposterIndex,
} from '../store/gameStore';
import PlayerAvatar from './PlayerAvatar';

type PeekPhase = 'idle' | 'warning' | 'select' | 'reveal';

const WARNING_DURATION = 2000; // 2 seconds warning
const REVEAL_DURATION = 3000; // 3 seconds to view role

export default function PeekButton() {
  const players = usePlayers();
  const currentWord = useCurrentWord();
  const config = useConfig();
  const imposterIndex = useImposterIndex();

  const [phase, setPhase] = useState<PeekPhase>('idle');
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);

  // Warning flash animation
  const warningOpacity = useRef(new Animated.Value(1)).current;
  const flashAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const handlePeekPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('warning');
    setSelectedPlayerIndex(null);

    // Flash animation
    flashAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(warningOpacity, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(warningOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    );
    flashAnimRef.current.start();

    // After warning, show player selection
    setTimeout(() => {
      if (flashAnimRef.current) {
        flashAnimRef.current.stop();
      }
      warningOpacity.setValue(1);
      setPhase('select');
    }, WARNING_DURATION);
  }, []);

  const handleSelectPlayer = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlayerIndex(index);
    setPhase('reveal');

    // Auto-close after reveal duration
    setTimeout(() => {
      setPhase('idle');
      setSelectedPlayerIndex(null);
    }, REVEAL_DURATION);
  }, []);

  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (flashAnimRef.current) {
      flashAnimRef.current.stop();
    }
    warningOpacity.setValue(1);
    setPhase('idle');
    setSelectedPlayerIndex(null);
  }, []);

  // Get the peeking player's role info
  const getPeekContent = () => {
    if (selectedPlayerIndex === null || !currentWord) return null;

    const isImposter = selectedPlayerIndex === imposterIndex;

    if (isImposter) {
      const hint = currentWord.hints[config.hintDifficulty];
      return {
        role: 'You are the Imposter 🕵️',
        content: hint,
        backgroundColor: colors.surface,
        textColor: colors.textDark,
        isImposter: true,
      };
    } else {
      return {
        role: 'VILLAGER',
        content: currentWord.word,
        backgroundColor: colors.surface,
        textColor: colors.textDark,
        isImposter: false,
      };
    }
  };

  const peekContent = getPeekContent();

  return (
    <>
      {/* Main Peek Button */}
      <Pressable
        style={({ pressed }) => [
          styles.peekButton,
          pressed && styles.peekButtonPressed,
        ]}
        onPress={handlePeekPress}
      >
        <Text style={styles.peekButtonText}>Peek 👀</Text>
        <Text style={styles.peekSubtext}>Forgot your word?</Text>
      </Pressable>

      {/* Warning Modal */}
      <Modal
        visible={phase === 'warning'}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Animated.View style={[styles.warningOverlay, { opacity: warningOpacity }]}>
          <View style={styles.warningContent}>
            <Text style={styles.warningEmoji}>⚠️</Text>
            <Text style={styles.warningText}>SOMEONE IS PEEKING!</Text>
            <Text style={styles.warningSubtext}>
              Everyone look at the screen!
            </Text>
          </View>
        </Animated.View>
      </Modal>

      {/* Player Selection Modal */}
      <Modal
        visible={phase === 'select'}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectContainer}>
            <Text style={styles.selectTitle}>Who are you?</Text>
            <Text style={styles.selectSubtext}>
              Select your name to see your role
            </Text>

            <ScrollView
              style={styles.playerList}
              contentContainerStyle={styles.playerListContent}
            >
              {players.map((player, index) => (
                <Pressable
                  key={player.id}
                  style={({ pressed }) => [
                    styles.playerButton,
                    pressed && styles.playerButtonPressed,
                  ]}
                  onPress={() => handleSelectPlayer(index)}
                >
                  <PlayerAvatar name={player.name} index={index} size="medium" />
                  <Text style={styles.playerButtonText}>{player.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Role Reveal Modal */}
      <Modal
        visible={phase === 'reveal'}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          {peekContent && selectedPlayerIndex !== null && (
            <View
              style={[
                styles.revealCard,
                { backgroundColor: peekContent.backgroundColor },
              ]}
            >
              <Text
                style={[
                  peekContent.isImposter ? styles.imposterRoleLabel : styles.roleLabel,
                  { color: peekContent.isImposter ? colors.textMuted : peekContent.textColor },
                ]}
              >
                {peekContent.role}
              </Text>
              <Text
                style={[
                  peekContent.isImposter ? styles.imposterRoleContent : styles.roleContent,
                  { color: peekContent.textColor },
                ]}
              >
                {peekContent.content}
              </Text>
              <Text
                style={[styles.peekingAs, { color: peekContent.textColor }]}
              >
                Viewing as: {players[selectedPlayerIndex].name}
              </Text>
              <Text style={styles.autoCloseText}>
                Closing in {REVEAL_DURATION / 1000}s...
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  peekButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  peekButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  peekButtonText: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textLight,
  },
  peekSubtext: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  warningOverlay: {
    flex: 1,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningContent: {
    alignItems: 'center',
  },
  warningEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  warningText: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.textLight,
    textAlign: 'center',
  },
  warningSubtext: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  selectContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxHeight: '80%',
    ...shadows.card,
  },
  selectTitle: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  selectSubtext: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  playerList: {
    maxHeight: 300,
  },
  playerListContent: {
    gap: spacing.sm,
  },
  playerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  playerButtonPressed: {
    opacity: 0.8,
  },
  playerButtonText: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.textDark,
    flex: 1,
  },
  cancelButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
  },
  revealCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '90%',
    ...shadows.card,
  },
  roleLabel: {
    fontFamily: fonts.label,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  roleContent: {
    fontFamily: fonts.heading,
    fontSize: 36,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  imposterRoleLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  imposterRoleContent: {
    fontFamily: fonts.heading,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  peekingAs: {
    fontFamily: fonts.body,
    fontSize: 14,
    opacity: 0.8,
  },
  autoCloseText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});

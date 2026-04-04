import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenCapture from 'expo-screen-capture';
import { colors, spacing, fonts } from '../constants/theme';
import HoldToReveal from './HoldToReveal';

interface CoverScreenProps {
  playerName: string;
  onReveal: () => void;
}

export default function CoverScreen({ playerName, onReveal }: CoverScreenProps) {
  // Prevent screen capture while this component is mounted
  useEffect(() => {
    const activateCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync();
    };
    activateCapture();

    return () => {
      // Note: We don't deactivate here - the parent screen manages the lifecycle
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top section with warning */}
        <View style={styles.warningSection}>
          <Text style={styles.emoji}>🫣</Text>
          <Text style={styles.eyesAway}>Eyes Away!</Text>
        </View>

        {/* Middle section with player name */}
        <View style={styles.playerSection}>
          <Text style={styles.passText}>Pass phone to</Text>
          <Text style={styles.playerName}>{playerName}</Text>
        </View>

        {/* Bottom section with hold to reveal */}
        <View style={styles.revealSection}>
          <Text style={styles.holdText}>Hold to reveal your role</Text>
          <HoldToReveal onReveal={onReveal} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.coverBg, // Pure black
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  warningSection: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  eyesAway: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.textLight,
    textAlign: 'center',
  },
  playerSection: {
    alignItems: 'center',
  },
  passText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  playerName: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.primary,
    textAlign: 'center',
  },
  revealSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  holdText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
});

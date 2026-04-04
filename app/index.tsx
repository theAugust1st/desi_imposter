import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fonts } from '../constants/theme';

export default function HomeScreen() {
  const patternOpacity = useSharedValue(0.05);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Subtle breathing animation for background pattern
    patternOpacity.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.05, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const patternStyle = useAnimatedStyle(() => ({
    opacity: patternOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleStartGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    router.push('/setup');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Pattern Placeholder */}
      <Animated.View style={[styles.patternOverlay, patternStyle]}>
        <View style={styles.patternGrid}>
          {/* Rangoli-inspired geometric pattern - simplified SVG placeholder */}
          {Array.from({ length: 6 }).map((_, row) =>
            Array.from({ length: 4 }).map((_, col) => (
              <View
                key={`${row}-${col}`}
                style={[
                  styles.patternDot,
                  {
                    top: row * 120 + 60,
                    left: col * 100 + 50,
                  },
                ]}
              />
            ))
          )}
        </View>
      </Animated.View>

      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Desi Imposter</Text>
          <Text style={styles.subtitle}>A South Asian Party Game</Text>
        </View>

        {/* CTA Button */}
        <View style={styles.buttonSection}>
          <Pressable onPress={handleStartGame}>
            <Animated.View style={[styles.button, buttonAnimatedStyle]}>
              <Text style={styles.buttonText}>Start New Game</Text>
            </Animated.View>
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
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternGrid: {
    flex: 1,
    position: 'relative',
  },
  patternDot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  titleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 48,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
  buttonSection: {
    paddingBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.label,
    fontSize: 18,
    color: colors.textDark,
  },
});

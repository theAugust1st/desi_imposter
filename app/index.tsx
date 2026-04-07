import { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, spacing, radius, fonts } from '../constants/theme';
import { haptics } from '../hooks/useHaptics';
import RangoliBackground from '../components/RangoliBackground';

export default function HomeScreen() {
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleStartGame = () => {
    haptics.buttonPress();
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
    router.push('/setup');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Rangoli Background Pattern */}
      <RangoliBackground opacity={0.07} />

      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Desi Imposter</Text>
          <Text style={styles.subtitle}>A South Asian Party Game</Text>
        </View>

        {/* Button Section */}
        <View style={styles.buttonSection}>
          {/* Start Game Button */}
          <Pressable onPress={handleStartGame}>
            <Animated.View style={[
              styles.button,
              { transform: [{ scale: buttonScale }] }
            ]}>
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

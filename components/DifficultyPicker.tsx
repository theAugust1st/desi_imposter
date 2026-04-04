import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fonts } from '../constants/theme';
import type { HintDifficulty } from '../types';

interface DifficultyPickerProps {
  selectedDifficulty: HintDifficulty;
  onSelectionChange: (difficulty: HintDifficulty) => void;
}

const difficulties: { value: HintDifficulty; label: string; description: string }[] = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Vague category hints',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Helpful context clues',
  },
  {
    value: 'spicy',
    label: 'Spicy',
    description: 'Almost gives it away',
  },
];

export default function DifficultyPicker({
  selectedDifficulty,
  onSelectionChange,
}: DifficultyPickerProps) {
  const handleSelect = (difficulty: HintDifficulty) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectionChange(difficulty);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Hint Difficulty</Text>
      <Text style={styles.hint}>
        How much help should the imposter get?
      </Text>
      <View style={styles.options}>
        {difficulties.map((difficulty) => (
          <DifficultyButton
            key={difficulty.value}
            difficulty={difficulty}
            isSelected={selectedDifficulty === difficulty.value}
            onPress={() => handleSelect(difficulty.value)}
          />
        ))}
      </View>
    </View>
  );
}

interface DifficultyButtonProps {
  difficulty: (typeof difficulties)[number];
  isSelected: boolean;
  onPress: () => void;
}

function DifficultyButton({
  difficulty,
  isSelected,
  onPress,
}: DifficultyButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getEmoji = () => {
    switch (difficulty.value) {
      case 'easy':
        return '😌';
      case 'medium':
        return '🤔';
      case 'spicy':
        return '🌶️';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.buttonWrapper}
    >
      <Animated.View
        style={[
          styles.difficultyButton,
          isSelected && styles.difficultyButtonSelected,
          animatedStyle,
        ]}
      >
        <Text style={styles.emoji}>{getEmoji()}</Text>
        <Text
          style={[
            styles.difficultyLabel,
            isSelected && styles.difficultyLabelSelected,
          ]}
        >
          {difficulty.label}
        </Text>
        <Text
          style={[
            styles.difficultyDescription,
            isSelected && styles.difficultyDescriptionSelected,
          ]}
        >
          {difficulty.description}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonWrapper: {
    flex: 1,
  },
  difficultyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.textMuted,
    backgroundColor: 'transparent',
  },
  difficultyButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
  },
  emoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  difficultyLabel: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  difficultyLabelSelected: {
    color: colors.textLight,
  },
  difficultyDescription: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  difficultyDescriptionSelected: {
    color: colors.textLight,
  },
});

import { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fonts } from '../constants/theme';
import type { Category } from '../types';
import { ALL_CATEGORIES } from '../types';

interface CategoryPickerProps {
  selectedCategories: Category[];
  onSelectionChange: (categories: Category[]) => void;
}

/**
 * Category display configuration with emojis
 * Order matches the grid layout
 */
const CATEGORY_CONFIG: Array<{ value: Category; label: string; emoji: string }> = [
  { value: 'food', label: 'Food', emoji: '🍛' },
  { value: 'festival', label: 'Festival', emoji: '🎉' },
  { value: 'cricket', label: 'Cricket', emoji: '🏏' },
  { value: 'culture', label: 'Culture', emoji: '🎭' },
  { value: 'places', label: 'Places', emoji: '📍' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { value: 'bollywood', label: 'Bollywood', emoji: '🎬' },
  { value: 'music', label: 'Music', emoji: '🎵' },
];

export default function CategoryPicker({
  selectedCategories,
  onSelectionChange,
}: CategoryPickerProps) {
  const handleToggle = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (selectedCategories.includes(category)) {
      // Remove category
      onSelectionChange(selectedCategories.filter((c) => c !== category));
    } else {
      // Add category
      onSelectionChange([...selectedCategories, category]);
    }
  };

  const handleSelectAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (selectedCategories.length === ALL_CATEGORIES.length) {
      // If all selected, deselect all
      onSelectionChange([]);
    } else {
      // Select all categories
      onSelectionChange([...ALL_CATEGORIES]);
    }
  };

  const allSelected = selectedCategories.length === ALL_CATEGORIES.length;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Categories</Text>
      <Text style={styles.hint}>Select at least 1 category</Text>

      {/* All Categories Button */}
      <AllCategoriesButton isSelected={allSelected} onPress={handleSelectAll} />

      {/* Category Grid - flexible wrap */}
      <View style={styles.grid}>
        {CATEGORY_CONFIG.map((category) => (
          <CategoryChip
            key={category.value}
            category={category}
            isSelected={selectedCategories.includes(category.value)}
            onPress={() => handleToggle(category.value)}
          />
        ))}
      </View>

      {/* Selection Count */}
      <Text style={styles.selectionCount}>
        {selectedCategories.length}{' '}
        {selectedCategories.length === 1 ? 'category' : 'categories'} selected
      </Text>
    </View>
  );
}

/**
 * "All Categories" toggle button
 */
interface AllCategoriesButtonProps {
  isSelected: boolean;
  onPress: () => void;
}

function AllCategoriesButton({ isSelected, onPress }: AllCategoriesButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.allButtonContainer}
    >
      <Animated.View
        style={[
          styles.allButton,
          isSelected && styles.allButtonSelected,
          { transform: [{ scale }] },
        ]}
      >
        <Text
          style={[styles.allButtonText, isSelected && styles.allButtonTextSelected]}
        >
          {isSelected ? '✓ All Categories' : 'All Categories'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Individual category chip component
 */
interface CategoryChipProps {
  category: { value: Category; label: string; emoji: string };
  isSelected: boolean;
  onPress: () => void;
}

function CategoryChip({ category, isSelected, onPress }: CategoryChipProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.chipContainer}
    >
      <Animated.View
        style={[
          styles.chip,
          isSelected && styles.chipSelected,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={styles.chipEmoji}>{category.emoji}</Text>
        <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
          {category.label}
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
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },

  // All Categories Button
  allButtonContainer: {
    marginBottom: spacing.md,
  },
  allButton: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  allButtonSelected: {
    backgroundColor: colors.primary,
  },
  allButtonText: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.primary,
  },
  allButtonTextSelected: {
    color: '#FFFFFF',
  },

  // Category Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipContainer: {
    width: '31%', // ~3 columns with gaps
    minWidth: 95,
  },
  chip: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    minHeight: 70,
  },
  chipSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#FFF3E0',
  },
  chipEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  chipLabel: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  chipLabelSelected: {
    color: colors.textDark,
  },

  // Selection Count
  selectionCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

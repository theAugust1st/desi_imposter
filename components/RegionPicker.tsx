import { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fonts } from '../constants/theme';
import { regions, type Region } from '../constants/regions';

interface RegionPickerProps {
  selectedRegions: Region[];
  onSelectionChange: (regions: Region[]) => void;
}

export default function RegionPicker({
  selectedRegions,
  onSelectionChange,
}: RegionPickerProps) {
  const handleToggle = (regionCode: Region, isRequired: boolean) => {
    // India cannot be deselected
    if (isRequired) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (selectedRegions.includes(regionCode)) {
      onSelectionChange(selectedRegions.filter((r) => r !== regionCode));
    } else {
      onSelectionChange([...selectedRegions, regionCode]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Who's in the room?</Text>
      <Text style={styles.hint}>
        Select all nationalities present. This affects which words appear.
      </Text>
      <View style={styles.grid}>
        {regions.map((region) => (
          <RegionButton
            key={region.code}
            region={region}
            isSelected={selectedRegions.includes(region.code)}
            onPress={() => handleToggle(region.code, region.isRequired)}
          />
        ))}
      </View>
    </View>
  );
}

interface RegionButtonProps {
  region: (typeof regions)[number];
  isSelected: boolean;
  onPress: () => void;
}

function RegionButton({ region, isSelected, onPress }: RegionButtonProps) {
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
    >
      <Animated.View
        style={[
          styles.regionButton,
          isSelected && styles.regionButtonSelected,
          region.isRequired && styles.regionButtonRequired,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={styles.flag}>{region.flag}</Text>
        <Text
          style={[
            styles.regionName,
            isSelected && styles.regionNameSelected,
          ]}
        >
          {region.name}
        </Text>
        {region.isRequired && (
          <Text style={styles.requiredBadge}>Always On</Text>
        )}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  regionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.textMuted,
    backgroundColor: 'transparent',
    minWidth: 80,
  },
  regionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
  },
  regionButtonRequired: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(0, 109, 119, 0.15)',
  },
  flag: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  regionName: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  regionNameSelected: {
    color: colors.textLight,
  },
  requiredBadge: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
});

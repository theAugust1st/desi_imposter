import { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fonts } from '../constants/theme';
import { regions, type Region } from '../constants/regions';

interface RegionPickerProps {
  selectedRegions: Region[];
  onSelectionChange: (regions: Region[]) => void;
}

export default function RegionPicker({
  selectedRegions,
  onSelectionChange,
}: RegionPickerProps) {
  const handleToggle = (regionCode: Region) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (selectedRegions.includes(regionCode)) {
      onSelectionChange(selectedRegions.filter((r) => r !== regionCode));
    } else {
      onSelectionChange([...selectedRegions, regionCode]);
    }
  };

  // Organize regions in 2x2 grid: [India, Nepal], [Bangladesh, Pakistan]
  const row1 = regions.slice(0, 2); // India, Nepal
  const row2 = regions.slice(2, 4); // Bangladesh, Pakistan

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Who's in the room?</Text>
      <Text style={styles.hint}>
        Select at least one nationality
      </Text>
      
      {/* Row 1: India, Nepal */}
      <View style={styles.row}>
        {row1.map((region) => (
          <RegionButton
            key={region.code}
            region={region}
            isSelected={selectedRegions.includes(region.code)}
            onPress={() => handleToggle(region.code)}
          />
        ))}
      </View>

      {/* Row 2: Bangladesh, Pakistan */}
      <View style={styles.row}>
        {row2.map((region) => (
          <RegionButton
            key={region.code}
            region={region}
            isSelected={selectedRegions.includes(region.code)}
            onPress={() => handleToggle(region.code)}
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
      style={styles.buttonContainer}
    >
      <Animated.View
        style={[
          styles.regionButton,
          isSelected && styles.regionButtonSelected,
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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  buttonContainer: {
    flex: 1,
  },
  regionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 64,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  regionButtonSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#FFF3E0',
  },
  flag: {
    fontSize: 22,
    marginRight: spacing.md,
  },
  regionName: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textMuted,
  },
  regionNameSelected: {
    color: colors.textDark,
  },
});

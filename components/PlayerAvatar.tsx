import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../constants/theme';

// Preset color palette for player avatars
const AVATAR_COLORS = [
  '#F5A623', // Saffron Gold
  '#006D77', // Deep Teal
  '#A8E063', // Electric Lime
  '#E74C3C', // Red
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#1ABC9C', // Turquoise
  '#F39C12', // Orange
  '#E91E63', // Pink
  '#00BCD4', // Cyan
] as const;

interface PlayerAvatarProps {
  name: string;
  index: number;
  size?: 'small' | 'medium' | 'large';
}

export default function PlayerAvatar({
  name,
  index,
  size = 'medium',
}: PlayerAvatarProps) {
  // Get initials from name (first letter of first and last name, or first two letters)
  const getInitials = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return '?';

    const parts = trimmed.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  };

  // Get consistent color based on player index
  const getColor = (index: number): string => {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  };

  const dimensions = {
    small: { size: 32, fontSize: 12 },
    medium: { size: 48, fontSize: 16 },
    large: { size: 72, fontSize: 24 },
  }[size];

  const backgroundColor = getColor(index);
  const initials = getInitials(name);

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions.size,
          height: dimensions.size,
          borderRadius: dimensions.size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: dimensions.fontSize,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

// Helper function to get avatar color by index (for use outside component)
export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: fonts.label,
    color: colors.textDark,
  },
});

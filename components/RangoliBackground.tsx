import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { colors } from '../constants/theme';

interface RangoliBackgroundProps {
  opacity?: number;
}

/**
 * Decorative rangoli-inspired geometric background pattern
 * Uses low opacity for subtle texture effect
 */
export default function RangoliBackground({ opacity = 0.07 }: RangoliBackgroundProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <G opacity={opacity}>
          {/* Central mandala pattern */}
          <Circle cx="200" cy="200" r="80" stroke={colors.primary} strokeWidth="2" fill="none" />
          <Circle cx="200" cy="200" r="60" stroke={colors.primary} strokeWidth="1.5" fill="none" />
          <Circle cx="200" cy="200" r="40" stroke={colors.primary} strokeWidth="1" fill="none" />
          <Circle cx="200" cy="200" r="20" stroke={colors.primary} strokeWidth="0.5" fill="none" />

          {/* 8-pointed star pattern */}
          <Path
            d="M200 120 L215 185 L280 200 L215 215 L200 280 L185 215 L120 200 L185 185 Z"
            stroke={colors.primary}
            strokeWidth="1.5"
            fill="none"
          />
          
          {/* Diagonal star points */}
          <Path
            d="M145 145 L190 190 L200 120 M255 145 L210 190 L280 200 M255 255 L210 210 L200 280 M145 255 L190 210 L120 200"
            stroke={colors.primary}
            strokeWidth="1"
            fill="none"
          />

          {/* Corner lotus petals - Top Left */}
          <Path
            d="M50 50 Q75 25 100 50 Q75 75 50 50"
            stroke={colors.primary}
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M30 70 Q55 45 80 70 Q55 95 30 70"
            stroke={colors.primary}
            strokeWidth="0.8"
            fill="none"
          />

          {/* Corner lotus petals - Top Right */}
          <Path
            d="M350 50 Q325 25 300 50 Q325 75 350 50"
            stroke={colors.primary}
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M370 70 Q345 45 320 70 Q345 95 370 70"
            stroke={colors.primary}
            strokeWidth="0.8"
            fill="none"
          />

          {/* Corner lotus petals - Bottom Left */}
          <Path
            d="M50 350 Q75 375 100 350 Q75 325 50 350"
            stroke={colors.primary}
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M30 330 Q55 355 80 330 Q55 305 30 330"
            stroke={colors.primary}
            strokeWidth="0.8"
            fill="none"
          />

          {/* Corner lotus petals - Bottom Right */}
          <Path
            d="M350 350 Q325 375 300 350 Q325 325 350 350"
            stroke={colors.primary}
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M370 330 Q345 355 320 330 Q345 305 370 330"
            stroke={colors.primary}
            strokeWidth="0.8"
            fill="none"
          />

          {/* Decorative dots around center */}
          <Circle cx="200" cy="100" r="4" fill={colors.primary} />
          <Circle cx="200" cy="300" r="4" fill={colors.primary} />
          <Circle cx="100" cy="200" r="4" fill={colors.primary} />
          <Circle cx="300" cy="200" r="4" fill={colors.primary} />
          
          <Circle cx="130" cy="130" r="3" fill={colors.primary} />
          <Circle cx="270" cy="130" r="3" fill={colors.primary} />
          <Circle cx="130" cy="270" r="3" fill={colors.primary} />
          <Circle cx="270" cy="270" r="3" fill={colors.primary} />

          {/* Outer decorative border circles */}
          <Circle cx="200" cy="50" r="6" stroke={colors.primary} strokeWidth="1" fill="none" />
          <Circle cx="200" cy="350" r="6" stroke={colors.primary} strokeWidth="1" fill="none" />
          <Circle cx="50" cy="200" r="6" stroke={colors.primary} strokeWidth="1" fill="none" />
          <Circle cx="350" cy="200" r="6" stroke={colors.primary} strokeWidth="1" fill="none" />

          {/* Connecting arcs */}
          <Path
            d="M100 50 Q200 0 300 50"
            stroke={colors.primary}
            strokeWidth="0.8"
            fill="none"
          />
          <Path
            d="M100 350 Q200 400 300 350"
            stroke={colors.primary}
            strokeWidth="0.8"
            fill="none"
          />
          <Path
            d="M50 100 Q0 200 50 300"
            stroke={colors.primary}
            strokeWidth="0.8"
            fill="none"
          />
          <Path
            d="M350 100 Q400 200 350 300"
            stroke={colors.primary}
            strokeWidth="0.8"
            fill="none"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
});

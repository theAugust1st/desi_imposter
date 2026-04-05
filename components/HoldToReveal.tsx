import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Easing, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../constants/theme';

const BUTTON_SIZE = 80;
const STROKE_WIDTH = 4;
const RADIUS = (BUTTON_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const HOLD_DURATION = 1500; // 1.5 seconds
const HAPTIC_INTERVAL = 300; // Light tick every 300ms

interface HoldToRevealProps {
  onReveal: () => void;
  disabled?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function HoldToReveal({ onReveal, disabled = false }: HoldToRevealProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [isHolding, setIsHolding] = useState(false);
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCompletedRef = useRef(false);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
      }
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
    };
  }, []);

  const startHapticFeedback = () => {
    // Initial tick
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Set up interval for continuous ticks
    hapticIntervalRef.current = setInterval(() => {
      if (!hasCompletedRef.current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, HAPTIC_INTERVAL);
  };

  const stopHapticFeedback = () => {
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }
  };

  const handleComplete = () => {
    hasCompletedRef.current = true;
    stopHapticFeedback();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onReveal();
  };

  const handlePressIn = () => {
    if (disabled) return;
    
    hasCompletedRef.current = false;
    setIsHolding(true);
    startHapticFeedback();
    
    // Scale down
    Animated.timing(scale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
    
    // Animate progress
    Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION,
      easing: Easing.linear,
      useNativeDriver: false, // strokeDashoffset doesn't support native driver
    }).start();
    
    // Set timeout for completion
    holdTimeoutRef.current = setTimeout(() => {
      handleComplete();
    }, HOLD_DURATION);
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    setIsHolding(false);
    stopHapticFeedback();
    
    // Clear the completion timeout
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    
    // Scale back
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
    
    // Reset progress if not completed
    if (!hasCompletedRef.current) {
      Animated.timing(progress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[
        styles.container,
        {
          transform: [{ scale }],
          opacity: disabled ? 0.5 : 1,
        }
      ]}>
        {/* Background circle */}
        <View style={styles.backgroundCircle} />
        
        {/* Progress ring */}
        <Svg width={BUTTON_SIZE} height={BUTTON_SIZE} style={styles.svg}>
          {/* Track */}
          <Circle
            cx={BUTTON_SIZE / 2}
            cy={BUTTON_SIZE / 2}
            r={RADIUS}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          {/* Progress */}
          <AnimatedCircle
            cx={BUTTON_SIZE / 2}
            cy={BUTTON_SIZE / 2}
            r={RADIUS}
            stroke={colors.primary}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${BUTTON_SIZE / 2}, ${BUTTON_SIZE / 2}`}
          />
        </Svg>
        
        {/* Center icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>👁️</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    width: BUTTON_SIZE - STROKE_WIDTH * 2,
    height: BUTTON_SIZE - STROKE_WIDTH * 2,
    borderRadius: (BUTTON_SIZE - STROKE_WIDTH * 2) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  svg: {
    position: 'absolute',
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
});

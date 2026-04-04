import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  runOnJS,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
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
  const progress = useSharedValue(0);
  const isHolding = useSharedValue(false);
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCompletedRef = useRef(false);

  // Cleanup haptic interval on unmount
  useEffect(() => {
    return () => {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
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

  const handleStart = () => {
    hasCompletedRef.current = false;
    startHapticFeedback();
  };

  const handleEnd = () => {
    stopHapticFeedback();
  };

  const gesture = Gesture.LongPress()
    .minDuration(HOLD_DURATION)
    .maxDistance(50)
    .onBegin(() => {
      if (disabled) return;
      isHolding.value = true;
      runOnJS(handleStart)();
      progress.value = withTiming(1, {
        duration: HOLD_DURATION,
        easing: Easing.linear,
      });
    })
    .onFinalize((_, success) => {
      isHolding.value = false;
      runOnJS(handleEnd)();
      
      if (success && !disabled) {
        runOnJS(handleComplete)();
      } else {
        // Cancelled early - reset progress
        cancelAnimation(progress);
        progress.value = withTiming(0, { duration: 200 });
      }
    });

  const progressProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
    };
  });

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: isHolding.value ? 0.95 : 1 }],
    opacity: disabled ? 0.5 : 1,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, buttonStyle]}>
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
            animatedProps={progressProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${BUTTON_SIZE / 2}, ${BUTTON_SIZE / 2}`}
          />
        </Svg>
        
        {/* Center icon */}
        <View style={styles.iconContainer}>
          <Animated.Text style={styles.icon}>👁️</Animated.Text>
        </View>
      </Animated.View>
    </GestureDetector>
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

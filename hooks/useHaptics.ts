import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

/**
 * Haptic feedback abstraction hook
 * Provides consistent haptic feedback patterns across the app
 */
export function useHaptics() {
  /**
   * Light tap - for navigation, toggles, minor interactions
   */
  const lightTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  /**
   * Medium tap - for confirmations, selections
   */
  const mediumTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  /**
   * Heavy tap - for important actions, reveals, warnings
   */
  const heavyTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  /**
   * Success notification - for completed actions, game start
   */
  const success = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  /**
   * Warning notification - for alerts, imposter reveal
   */
  const warning = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  /**
   * Error notification - for failures, invalid actions
   */
  const error = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  /**
   * Selection changed - for pickers, toggles
   */
  const selection = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  /**
   * Button press - standard button feedback (medium impact)
   */
  const buttonPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  /**
   * Tick - for progress indicators, countdowns
   */
  const tick = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return {
    lightTap,
    mediumTap,
    heavyTap,
    success,
    warning,
    error,
    selection,
    buttonPress,
    tick,
  };
}

// Standalone functions for use outside of React components
export const haptics = {
  lightTap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  mediumTap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavyTap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
  buttonPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  tick: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
};

export default useHaptics;

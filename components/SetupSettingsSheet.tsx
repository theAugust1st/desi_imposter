import { useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  InteractionManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts, shadows } from '../constants/theme';
import RegionPicker from './RegionPicker';
import CategoryPicker from './CategoryPicker';
import type { Region } from '../constants/regions';
import type { Category } from '../types';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_TOP_RADIUS = 24;
const ANIM_DURATION_MS = 220;

interface SetupSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedRegions: Region[];
  onRegionsChange: (regions: Region[]) => void;
  selectedCategories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  packWordsCount: number;
  onManagePacks: () => void;
}

export default function SetupSettingsSheet({
  visible,
  onClose,
  selectedRegions,
  onRegionsChange,
  selectedCategories,
  onCategoriesChange,
  packWordsCount,
  onManagePacks,
}: SetupSettingsSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetHeightRef = useRef<number>(Math.round(SCREEN_HEIGHT * 0.6));

  const statsText = useMemo(() => {
    const words = packWordsCount;
    return `${words} enabled word${words === 1 ? '' : 's'}`;
  }, [packWordsCount]);

  const open = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIM_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: ANIM_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const close = (afterClose?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeightRef.current,
        duration: ANIM_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: ANIM_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      onClose();
      if (afterClose) {
        InteractionManager.runAfterInteractions(afterClose);
      }
    });
  };

  useEffect(() => {
    if (visible) {
      // Reset to hidden state before opening animation (helps if reopened quickly).
      translateY.setValue(sheetHeightRef.current);
      backdropOpacity.setValue(0);
      open();
    }
  }, [visible, translateY, backdropOpacity]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => close()}
    >
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close()}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.45],
                }),
              },
            ]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            sheetHeightRef.current = h;
          }}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Pressable onPress={() => close()} style={styles.doneButton}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionCard}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBubble}>
                    <Ionicons name="cube-outline" size={18} color={colors.secondary} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>Content Packs</Text>
                    <Text style={styles.rowSubtitle}>{statsText}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => close(onManagePacks)}
                  style={styles.manageButton}
                >
                  <Text style={styles.manageText}>Manage</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <RegionPicker
                selectedRegions={selectedRegions}
                onSelectionChange={onRegionsChange}
              />
            </View>

            <View style={styles.sectionCard}>
              <CategoryPicker
                selectedCategories={selectedCategories}
                onSelectionChange={onCategoriesChange}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: SHEET_TOP_RADIUS,
    borderTopRightRadius: SHEET_TOP_RADIUS,
    maxHeight: Math.round(SCREEN_HEIGHT * 0.88),
    paddingTop: spacing.sm,
    ...shadows.card,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textDark,
  },
  doneButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: 'rgba(245, 166, 35, 0.18)',
  },
  doneText: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.md,
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 109, 119, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.textDark,
  },
  rowSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  manageButton: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  manageText: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textDark,
  },
});

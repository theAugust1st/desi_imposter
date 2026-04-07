import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts } from '../constants/theme';
import { useGameStore, usePlayers, useConfig, usePackWords } from '../store/gameStore';
import { getWordCount, hasMinimumWords } from '../data';
import { haptics } from '../hooks/useHaptics';
import type { Region } from '../constants/regions';
import type { HintDifficulty, Category } from '../types';
import { ALL_CATEGORIES } from '../types';
import RegionPicker from '../components/RegionPicker';
import CategoryPicker from '../components/CategoryPicker';
import DifficultyPicker from '../components/DifficultyPicker';
import RangoliBackground from '../components/RangoliBackground';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

export default function SetupScreen() {
  const { setConfig, setPlayers, startGame, clearPlayers, loadPackWords } = useGameStore();
  const storePlayers = usePlayers();
  const storeConfig = useConfig();
  const packWords = usePackWords();
  
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '']);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([...ALL_CATEGORIES]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<HintDifficulty>('medium');

  const buttonScale = useRef(new Animated.Value(1)).current;

  // Load pack words on mount
  useEffect(() => {
    loadPackWords();
  }, []);

  // On mount, pre-fill from store if players exist
  useEffect(() => {
    if (storePlayers.length > 0) {
      // Pre-fill with existing player names from store
      const names = storePlayers.map((p) => p.name);
      // Ensure at least MIN_PLAYERS slots
      while (names.length < MIN_PLAYERS) {
        names.push('');
      }
      setPlayerNames(names);
    }
    // Also restore region, category, and difficulty settings
    if (storeConfig.selectedNationalities.length > 0) {
      setSelectedRegions(storeConfig.selectedNationalities);
    }
    if (storeConfig.selectedCategories && storeConfig.selectedCategories.length > 0) {
      setSelectedCategories(storeConfig.selectedCategories);
    }
    if (storeConfig.hintDifficulty) {
      setSelectedDifficulty(storeConfig.hintDifficulty);
    }
  }, []);

  const validPlayers = playerNames.filter((name) => name.trim().length > 0);
  const wordCount = getWordCount(selectedRegions, selectedCategories, packWords);
  const hasEnoughWords = hasMinimumWords(selectedRegions, selectedCategories, packWords, 10);
  const canStartGame = 
    validPlayers.length >= MIN_PLAYERS && 
    selectedRegions.length >= 1 && 
    selectedCategories.length >= 1 &&
    hasEnoughWords;
  const canAddPlayer = playerNames.length < MAX_PLAYERS;

  const handleAddPlayer = () => {
    if (!canAddPlayer) return;
    haptics.lightTap();
    setPlayerNames([...playerNames, '']);
  };

  const handleRemovePlayer = (index: number) => {
    if (playerNames.length <= MIN_PLAYERS) {
      haptics.warning();
      return;
    }
    haptics.lightTap();
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const handleClearAllPlayers = () => {
    haptics.lightTap();
    setPlayerNames(['', '', '']);
    clearPlayers();
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const handleRegionChange = (regions: Region[]) => {
    haptics.selection();
    setSelectedRegions(regions);
  };

  const handleCategoryChange = (categories: Category[]) => {
    haptics.selection();
    setSelectedCategories(categories);
  };

  const handleDifficultyChange = (difficulty: HintDifficulty) => {
    haptics.selection();
    setSelectedDifficulty(difficulty);
  };

  const handleStartGame = async () => {
    if (!canStartGame) return;

    haptics.mediumTap();
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
    
    // Update store with config
    setConfig({
      selectedNationalities: selectedRegions,
      selectedCategories: selectedCategories,
      hintDifficulty: selectedDifficulty,
    });
    
    // Set players (only valid names)
    setPlayers(validPlayers);
    
    // Start the game (assigns word, imposter, etc.)
    await startGame();
    
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    
    // Navigate to distribution
    router.push('/distribute/0');
  };

  const handleBack = () => {
    haptics.lightTap();
    router.back();
  };

  const handleContentPacks = () => {
    haptics.lightTap();
    router.push('/packs');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Rangoli Background Pattern */}
      <RangoliBackground opacity={0.05} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textDark} />
            </Pressable>
            <Text style={styles.title}>Game Setup</Text>
            <Pressable onPress={handleContentPacks} style={styles.packsButton}>
              <Ionicons name="cube-outline" size={24} color={colors.secondary} />
            </Pressable>
          </View>

          {/* Player Names Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Players</Text>
            <Text style={styles.sectionHint}>
              {validPlayers.length} of {MIN_PLAYERS}-{MAX_PLAYERS} players
            </Text>

            {playerNames.map((name, index) => (
              <View
                key={index}
                style={styles.playerRow}
              >
                <View style={styles.playerNumber}>
                  <Text style={styles.playerNumberText}>{index + 1}</Text>
                </View>
                <TextInput
                  style={styles.playerInput}
                  placeholder={`Player ${index + 1}`}
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={(text) => handlePlayerNameChange(index, text)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {playerNames.length > MIN_PLAYERS && (
                  <Pressable
                    onPress={() => handleRemovePlayer(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.danger} />
                  </Pressable>
                )}
              </View>
            ))}

            {canAddPlayer && (
              <Pressable onPress={handleAddPlayer} style={styles.addPlayerButton}>
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.addPlayerText}>Add Player</Text>
              </Pressable>
            )}

            {validPlayers.length > 0 && (
              <Pressable onPress={handleClearAllPlayers} style={styles.clearAllButton}>
                <Text style={styles.clearAllText}>Clear All Players</Text>
              </Pressable>
            )}
          </View>

          {/* Region Picker */}
          <View style={styles.section}>
            <RegionPicker
              selectedRegions={selectedRegions}
              onSelectionChange={handleRegionChange}
            />
          </View>

          {/* Category Picker */}
          <View style={styles.section}>
            <CategoryPicker
              selectedCategories={selectedCategories}
              onSelectionChange={handleCategoryChange}
            />
            {/* Word Count Display */}
            <Text style={styles.wordCount}>
              {wordCount} words available
            </Text>
            {/* Warning if not enough words */}
            {!hasEnoughWords && selectedCategories.length > 0 && selectedRegions.length > 0 && (
              <Text style={styles.warningText}>
                Not enough words (need at least 10). Try selecting more categories or regions.
              </Text>
            )}
          </View>

          {/* Difficulty Picker */}
          <View style={styles.section}>
            <DifficultyPicker
              selectedDifficulty={selectedDifficulty}
              onSelectionChange={handleDifficultyChange}
            />
          </View>
        </ScrollView>

        {/* Start Game Button */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleStartGame}
            disabled={!canStartGame}
          >
            <Animated.View
              style={[
                styles.startButton,
                !canStartGame && styles.startButtonDisabled,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              <Text
                style={[
                  styles.startButtonText,
                  !canStartGame && styles.startButtonTextDisabled,
                ]}
              >
                {canStartGame
                  ? 'Start Game'
                  : validPlayers.length < MIN_PLAYERS
                  ? `Need ${MIN_PLAYERS - validPlayers.length} more player${
                      MIN_PLAYERS - validPlayers.length === 1 ? '' : 's'
                    }`
                  : selectedRegions.length < 1
                  ? 'Select at least 1 nationality'
                  : selectedCategories.length < 1
                  ? 'Select at least 1 category'
                  : !hasEnoughWords
                  ? 'Not enough words'
                  : 'Start Game'}
              </Text>
            </Animated.View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  packsButton: {
    padding: spacing.sm,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.textDark,
  },

  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  playerNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  playerNumberText: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textLight,
  },
  playerInput: {
    flex: 1,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textDark,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  removeButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  addPlayerText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  clearAllButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  clearAllText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.danger,
  },
  wordCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  warningText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(140, 140, 158, 0.2)',
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(245, 166, 35, 0.3)',
  },
  startButtonText: {
    fontFamily: fonts.label,
    fontSize: 18,
    color: colors.textDark,
  },
  startButtonTextDisabled: {
    color: colors.textMuted,
  },
});

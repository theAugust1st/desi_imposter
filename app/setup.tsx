import { useState, useRef } from 'react';
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
import { useGameStore } from '../store/gameStore';
import { getTotalWordCount } from '../data';
import { haptics } from '../hooks/useHaptics';
import type { Region } from '../constants/regions';
import type { HintDifficulty } from '../types';
import RegionPicker from '../components/RegionPicker';
import DifficultyPicker from '../components/DifficultyPicker';
import RangoliBackground from '../components/RangoliBackground';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

export default function SetupScreen() {
  const { setConfig, setPlayers, startGame } = useGameStore();
  
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '']);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>(['IN']);
  const [selectedDifficulty, setSelectedDifficulty] = useState<HintDifficulty>('medium');

  const buttonScale = useRef(new Animated.Value(1)).current;

  const validPlayers = playerNames.filter((name) => name.trim().length > 0);
  const canStartGame = validPlayers.length >= MIN_PLAYERS;
  const canAddPlayer = playerNames.length < MAX_PLAYERS;
  const wordCount = getTotalWordCount(selectedRegions);

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

  const handlePlayerNameChange = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const handleRegionChange = (regions: Region[]) => {
    haptics.selection();
    setSelectedRegions(regions);
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
              <Ionicons name="arrow-back" size={24} color={colors.textLight} />
            </Pressable>
            <Text style={styles.title}>Game Setup</Text>
            <View style={styles.placeholder} />
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
          </View>

          {/* Region Picker */}
          <View style={styles.section}>
            <RegionPicker
              selectedRegions={selectedRegions}
              onSelectionChange={handleRegionChange}
            />
            <Text style={styles.wordCount}>
              {wordCount} words in pool
            </Text>
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
                  : `Need ${MIN_PLAYERS - validPlayers.length} more player${
                      MIN_PLAYERS - validPlayers.length === 1 ? '' : 's'
                    }`}
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
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.textLight,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.textLight,
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
    backgroundColor: 'rgba(255, 248, 238, 0.1)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 238, 0.2)',
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
  wordCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 248, 238, 0.1)',
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

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts, shadows } from '../constants/theme';
import { haptics } from '../hooks/useHaptics';
import { PackManager } from '../utils/packManager';
import { useGameStore } from '../store/gameStore';
import RangoliBackground from '../components/RangoliBackground';
import type { PackMetadata, InstalledPack, PackStorageStats } from '../types/contentPack';

export default function PacksScreen() {
  const { loadPackWords } = useGameStore();
  
  // State
  const [availablePacks, setAvailablePacks] = useState<PackMetadata[]>([]);
  const [installedPacks, setInstalledPacks] = useState<InstalledPack[]>([]);
  const [storageStats, setStorageStats] = useState<PackStorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load packs on mount
  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setError(null);
      
      // Load installed packs first (always works offline)
      const installed = await PackManager.getInstalledPacks();
      setInstalledPacks(installed);
      
      const stats = await PackManager.getStorageStats();
      setStorageStats(stats);

      // Then try to fetch available packs (requires internet)
      try {
        const available = await PackManager.fetchAvailablePacks();
        setAvailablePacks(available);
      } catch (fetchError) {
        // Don't show error if we have installed packs to display
        if (installed.length === 0) {
          setError('Could not load available packs. Check your internet connection.');
        }
      }
    } catch (err) {
      setError('Failed to load packs.');
      console.error('[PacksScreen] Load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPacks();
  }, []);

  const handleDownload = async (metadata: PackMetadata) => {
    try {
      haptics.buttonPress();
      setDownloading(metadata.id);

      const pack = await PackManager.downloadPack(metadata);
      await PackManager.installPack(pack);
      
      // Reload packs and update game store
      await loadPacks();
      await loadPackWords();
      
      haptics.success();
      Alert.alert('Success', `"${metadata.name}" has been installed!`);
    } catch (err) {
      haptics.error();
      Alert.alert('Download Failed', (err as Error).message);
    } finally {
      setDownloading(null);
    }
  };

  const handleToggle = async (packId: string, enabled: boolean) => {
    try {
      haptics.lightTap();
      await PackManager.togglePack(packId, enabled);
      await loadPacks();
      await loadPackWords();
    } catch (err) {
      haptics.error();
      Alert.alert('Error', 'Failed to update pack settings.');
    }
  };

  const handleDelete = async (packId: string, name: string) => {
    haptics.warning();
    Alert.alert(
      'Delete Pack',
      `Are you sure you want to delete "${name}"? You can download it again later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await PackManager.deletePack(packId);
              await loadPacks();
              await loadPackWords();
              haptics.success();
            } catch (err) {
              haptics.error();
              Alert.alert('Error', 'Failed to delete pack.');
            }
          },
        },
      ]
    );
  };

  const isPackInstalled = (packId: string) => {
    return installedPacks.some((p) => p.packId === packId);
  };

  const getInstalledPackInfo = (packId: string) => {
    return installedPacks.find((p) => p.packId === packId);
  };

  // Filter available packs to show only those not installed
  const notInstalledPacks = availablePacks.filter(
    (pack) => !isPackInstalled(pack.id)
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <RangoliBackground opacity={0.05} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading packs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <RangoliBackground opacity={0.05} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Content Packs</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Storage Stats */}
        {storageStats && storageStats.packCount > 0 && (
          <View style={styles.statsCard}>
            <Ionicons name="folder-open" size={20} color={colors.secondary} />
            <Text style={styles.statsText}>
              {storageStats.packCount} pack{storageStats.packCount !== 1 ? 's' : ''} installed
              {' • '}
              {storageStats.totalWords} words
              {' • '}
              {storageStats.totalSizeKB} KB
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="cloud-offline" size={24} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={onRefresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Installed Packs Section */}
        {installedPacks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Installed</Text>
            {installedPacks.map((pack) => (
              <View key={pack.packId} style={styles.packCard}>
                <View style={styles.packInfo}>
                  <Text style={styles.packName}>{pack.name}</Text>
                  <Text style={styles.packDescription} numberOfLines={2}>
                    {pack.description}
                  </Text>
                  <View style={styles.packMeta}>
                    <Text style={styles.packMetaText}>
                      {pack.wordCount} words
                    </Text>
                    <Text style={styles.packMetaDot}>•</Text>
                    <Text style={styles.packMetaText}>
                      {pack.category}
                    </Text>
                  </View>
                </View>
                <View style={styles.packActions}>
                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleLabel}>
                      {pack.enabled ? 'On' : 'Off'}
                    </Text>
                    <Switch
                      value={pack.enabled}
                      onValueChange={(value) => handleToggle(pack.packId, value)}
                      trackColor={{ false: colors.textMuted, true: colors.accent }}
                      thumbColor={colors.surface}
                    />
                  </View>
                  <Pressable
                    onPress={() => handleDelete(pack.packId, pack.name)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Available Packs Section */}
        {notInstalledPacks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available</Text>
            {notInstalledPacks.map((pack) => (
              <View key={pack.id} style={styles.packCard}>
                <View style={styles.packInfo}>
                  <Text style={styles.packName}>{pack.name}</Text>
                  <Text style={styles.packDescription} numberOfLines={2}>
                    {pack.description}
                  </Text>
                  <View style={styles.packMeta}>
                    <Text style={styles.packMetaText}>
                      {pack.wordCount} words
                    </Text>
                    <Text style={styles.packMetaDot}>•</Text>
                    <Text style={styles.packMetaText}>
                      {pack.sizeKB} KB
                    </Text>
                    <Text style={styles.packMetaDot}>•</Text>
                    <Text style={styles.packMetaText}>
                      {pack.category}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => handleDownload(pack)}
                  disabled={downloading === pack.id}
                  style={[
                    styles.downloadButton,
                    downloading === pack.id && styles.downloadButtonDisabled,
                  ]}
                >
                  {downloading === pack.id ? (
                    <ActivityIndicator size="small" color={colors.textDark} />
                  ) : (
                    <>
                      <Ionicons name="download" size={18} color={colors.textDark} />
                      <Text style={styles.downloadButtonText}>Get</Text>
                    </>
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {installedPacks.length === 0 && notInstalledPacks.length === 0 && !error && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Packs Available</Text>
            <Text style={styles.emptyText}>
              Check back later for new content packs!
            </Text>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={colors.secondary} />
          <Text style={styles.infoText}>
            Content packs add more words to your game. Downloaded packs work offline.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textDark,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  statsText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  errorCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  retryText: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textDark,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  packInfo: {
    flex: 1,
  },
  packName: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  packDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  packMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packMetaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  packMetaDot: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
  packActions: {
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  toggleLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginLeft: spacing.md,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textDark,
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textDark,
    marginTop: spacing.md,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 109, 119, 0.1)',
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  infoText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

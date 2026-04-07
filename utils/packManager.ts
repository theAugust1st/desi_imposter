import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WordEntry } from '../types';
import type {
  PackManifest,
  PackMetadata,
  ContentPack,
  InstalledPack,
  PackStorageStats,
} from '../types/contentPack';

// GitHub raw content URL for the content packs repository
const MANIFEST_URL =
  'https://raw.githubusercontent.com/theAugust1st/desi-imposter-content-packs/main/manifest.json';

// AsyncStorage keys
const INSTALLED_PACKS_KEY = '@desi_imposter:installed_packs';

/**
 * PackManager handles all content pack operations:
 * - Fetching available packs from GitHub
 * - Downloading and installing packs
 * - Managing installed packs (enable/disable/delete)
 * - Loading pack words for gameplay
 */
class PackManagerClass {
  /**
   * Fetch the manifest of available packs from GitHub
   * @returns Array of pack metadata (without word data)
   */
  async fetchAvailablePacks(): Promise<PackMetadata[]> {
    try {
      const response = await fetch(MANIFEST_URL, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const manifest: PackManifest = await response.json();
      return manifest.packs;
    } catch (error) {
      console.error('[PackManager] Failed to fetch manifest:', error);
      throw new Error(
        'Failed to load content packs. Please check your internet connection.'
      );
    }
  }

  /**
   * Download a specific content pack from GitHub
   * @param metadata - Pack metadata containing download URL
   * @param onProgress - Optional callback for progress updates
   * @returns Full content pack with word data
   */
  async downloadPack(
    metadata: PackMetadata,
    onProgress?: (progress: number) => void
  ): Promise<ContentPack> {
    try {
      onProgress?.(10);

      const response = await fetch(metadata.downloadUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      onProgress?.(50);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const pack: ContentPack = await response.json();
      onProgress?.(100);

      return pack;
    } catch (error) {
      console.error('[PackManager] Failed to download pack:', error);
      throw new Error(`Failed to download "${metadata.name}". Please try again.`);
    }
  }

  /**
   * Install a downloaded pack to AsyncStorage
   * @param pack - Full content pack to install
   */
  async installPack(pack: ContentPack): Promise<void> {
    try {
      const installed = await this.getInstalledPacks();

      // Check if pack already exists (update it)
      const existingIndex = installed.findIndex((p) => p.packId === pack.id);

      const newPack: InstalledPack = {
        packId: pack.id,
        version: pack.version,
        name: pack.name,
        description: pack.description,
        category: pack.category,
        regions: pack.regions,
        wordCount: pack.words.length,
        installedAt: Date.now(),
        enabled: true,
        words: pack.words,
      };

      if (existingIndex >= 0) {
        // Update existing pack, preserve enabled state
        newPack.enabled = installed[existingIndex].enabled;
        installed[existingIndex] = newPack;
      } else {
        // Add new pack
        installed.push(newPack);
      }

      await AsyncStorage.setItem(INSTALLED_PACKS_KEY, JSON.stringify(installed));
      console.log(
        `[PackManager] Installed pack: ${pack.name} (${pack.words.length} words)`
      );
    } catch (error) {
      console.error('[PackManager] Failed to install pack:', error);
      throw new Error('Failed to save pack to device storage.');
    }
  }

  /**
   * Get all installed packs from AsyncStorage
   * @returns Array of installed packs with word data
   */
  async getInstalledPacks(): Promise<InstalledPack[]> {
    try {
      const stored = await AsyncStorage.getItem(INSTALLED_PACKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[PackManager] Failed to load installed packs:', error);
      return [];
    }
  }

  /**
   * Enable or disable a pack without deleting it
   * @param packId - ID of the pack to toggle
   * @param enabled - New enabled state
   */
  async togglePack(packId: string, enabled: boolean): Promise<void> {
    try {
      const installed = await this.getInstalledPacks();
      const updated = installed.map((pack) =>
        pack.packId === packId ? { ...pack, enabled } : pack
      );
      await AsyncStorage.setItem(INSTALLED_PACKS_KEY, JSON.stringify(updated));
      console.log(`[PackManager] Pack ${packId} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('[PackManager] Failed to toggle pack:', error);
      throw new Error('Failed to update pack settings.');
    }
  }

  /**
   * Delete a pack from storage
   * @param packId - ID of the pack to delete
   */
  async deletePack(packId: string): Promise<void> {
    try {
      const installed = await this.getInstalledPacks();
      const filtered = installed.filter((pack) => pack.packId !== packId);
      await AsyncStorage.setItem(INSTALLED_PACKS_KEY, JSON.stringify(filtered));
      console.log(`[PackManager] Deleted pack: ${packId}`);
    } catch (error) {
      console.error('[PackManager] Failed to delete pack:', error);
      throw new Error('Failed to delete pack.');
    }
  }

  /**
   * Get all words from enabled packs
   * @returns Combined array of words from all enabled packs
   */
  async getEnabledPackWords(): Promise<WordEntry[]> {
    try {
      const installed = await this.getInstalledPacks();
      const enabled = installed.filter((pack) => pack.enabled);
      return enabled.flatMap((pack) => pack.words);
    } catch (error) {
      console.error('[PackManager] Failed to get enabled pack words:', error);
      return [];
    }
  }

  /**
   * Check if a specific pack is installed
   * @param packId - ID of the pack to check
   * @returns true if pack is installed
   */
  async isPackInstalled(packId: string): Promise<boolean> {
    const installed = await this.getInstalledPacks();
    return installed.some((pack) => pack.packId === packId);
  }

  /**
   * Get installed pack by ID
   * @param packId - ID of the pack
   * @returns InstalledPack or undefined if not found
   */
  async getInstalledPack(packId: string): Promise<InstalledPack | undefined> {
    const installed = await this.getInstalledPacks();
    return installed.find((pack) => pack.packId === packId);
  }

  /**
   * Get storage statistics for installed packs
   * @returns Stats including pack count, word count, and size
   */
  async getStorageStats(): Promise<PackStorageStats> {
    const installed = await this.getInstalledPacks();
    const totalWords = installed.reduce((sum, pack) => sum + pack.words.length, 0);
    const totalSizeKB = installed.reduce((sum, pack) => {
      // Estimate size based on JSON stringification
      const jsonSize = JSON.stringify(pack.words).length / 1024;
      return sum + jsonSize;
    }, 0);

    return {
      packCount: installed.length,
      totalWords,
      totalSizeKB: Math.round(totalSizeKB),
    };
  }

  /**
   * Clear all installed packs (for debugging/reset)
   */
  async clearAllPacks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(INSTALLED_PACKS_KEY);
      console.log('[PackManager] Cleared all installed packs');
    } catch (error) {
      console.error('[PackManager] Failed to clear packs:', error);
      throw new Error('Failed to clear packs.');
    }
  }
}

// Export singleton instance
export const PackManager = new PackManagerClass();

import type { Region } from '../constants/regions';
import type { Category, WordEntry } from './index';

/**
 * Lightweight pack metadata for manifest listing
 * Does not include actual word data - used for browsing available packs
 */
export interface PackMetadata {
  id: string;
  version: string;
  name: string;
  description: string;
  category: Category;
  regions: Region[];
  wordCount: number;
  sizeKB: number;
  thumbnail?: string;
  releaseDate: string;
  downloadUrl: string;
  checksum?: string;
}

/**
 * Full content pack with word data
 * Downloaded from GitHub and stored locally
 */
export interface ContentPack {
  id: string;
  version: string;
  name: string;
  description: string;
  category: Category;
  regions: Region[];
  wordCount: number;
  sizeKB: number;
  thumbnail?: string;
  releaseDate: string;
  words: WordEntry[];
}

/**
 * Pack manifest from GitHub
 * Lists all available packs for download
 */
export interface PackManifest {
  version: string;
  lastUpdated: string;
  packs: PackMetadata[];
}

/**
 * Installed pack storage format
 * Saved in AsyncStorage with enabled state
 */
export interface InstalledPack {
  packId: string;
  version: string;
  name: string;
  description: string;
  category: Category;
  regions: Region[];
  wordCount: number;
  installedAt: number;
  enabled: boolean;
  words: WordEntry[];
}

/**
 * Download progress state for UI
 */
export interface DownloadProgress {
  packId: string;
  status: 'idle' | 'downloading' | 'installing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

/**
 * Storage statistics for display
 */
export interface PackStorageStats {
  packCount: number;
  totalWords: number;
  totalSizeKB: number;
}

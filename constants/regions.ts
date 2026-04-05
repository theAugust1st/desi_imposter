export type Region = 'IN' | 'NP' | 'BD' | 'PK';

export interface RegionConfig {
  code: Region;
  name: string;
  flag: string;
}

export const regions: RegionConfig[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
  },
  {
    code: 'NP',
    name: 'Nepal',
    flag: '🇳🇵',
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    flag: '🇧🇩',
  },
  {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
  },
] as const;

export const getRegionByCode = (code: Region): RegionConfig | undefined => {
  return regions.find((r) => r.code === code);
};

export const getRegionLabel = (code: Region): string => {
  const region = getRegionByCode(code);
  return region ? `${region.flag} ${region.name}` : code;
};

export const getRegionFlag = (code: Region): string => {
  const region = getRegionByCode(code);
  return region?.flag ?? '';
};

// Shared Desi scope label
export const SHARED_LABEL = '🌏 Shared Desi';

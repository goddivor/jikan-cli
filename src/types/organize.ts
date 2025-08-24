export interface ParsedAnimeFile {
  originalPath: string;
  fileName: string;
  animeName: string;
  season?: number;
  episode: number;
  language?: 'VF' | 'VOSTFR';
  platform?: string;
  confidence: number; // Score de confiance 0-100
  pattern?: string; // Pattern utilisé pour parser
}

export interface AnimeMatch {
  parsedFile: ParsedAnimeFile;
  jikanData?: {
    id: number;
    title: string;
    title_english?: string;
    title_japanese?: string;
    episodes?: number;
    season?: string;
    year?: number;
  };
  normalizedName: string;
  targetPath: string;
}

export interface OrganizeOptions {
  sourceDirectory: string;
  targetDirectory?: string;
  preview?: boolean;
  interactive?: boolean;
  minConfidence?: number; // Seuil minimum de confiance (défaut: 70)
  adjustConfidence?: boolean; // Force confidence adjustment interface
  createSeasonFolders?: boolean;
  handleDuplicates?: 'skip' | 'rename' | 'overwrite';
  videoExtensions?: string[];
}

export interface OrganizeResult {
  processed: number;
  organized: number;
  skipped: number;
  errors: number;
  matches: AnimeMatch[];
  skippedFiles: string[];
  errorFiles: { file: string; error: string }[];
}

export interface AnimePattern {
  name: string;
  regex: RegExp;
  extractGroups: {
    animeName: number;
    season?: number;
    episode: number;
    language?: number;
    platform?: number;
  };
  confidence: number; // Score de base du pattern
  description: string;
}

export interface FileClassification {
  file: string;
  type: 'anime' | 'other';
  confidence: number;
  reason: string;
}
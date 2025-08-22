import path from "path";
import { ParsedAnimeFile, AnimePattern, FileClassification } from "../types/organize";

export class FileParser {
  private static readonly ANIME_PATTERNS: AnimePattern[] = [
    // Voiranime long pattern: "Naruto- Shippuuden (VF) - Naruto Shippuden - 052 VF - 052 - Voiranime.mp4"
    {
      name: "Voiranime Long",
      regex: /^(.+?)\s*(?:\(([VF|VOSTFR]+)\))?\s*-\s*(.+?)\s*-\s*(\d+)(?:x(\d+))?\s*(?:VF|VOSTFR)\s*-\s*\4\s*-\s*Voiranime/i,
      extractGroups: {
        animeName: 1,
        season: 0, // Pas de saison dans ce pattern
        episode: 4,
        language: 2,
        platform: 0
      },
      confidence: 95,
      description: "Format Voiranime complet avec répétition épisode"
    },

    // Voiranime season pattern: "Shingeki no Kyojin 3 (VF) - Shingeki No Kyojin (Attaque Des Titans) (Saison 3) - 17 VF - 17 - Voiranime.mp4"
    {
      name: "Voiranime Season",
      regex: /^(.+?)\s+(\d+)\s*(?:\(([VF|VOSTFR]+)\))?\s*-\s*.+?\s*(?:\(Saison\s+\2\))?\s*-\s*(\d+)\s*(?:VF|VOSTFR)\s*-\s*\4\s*-\s*Voiranime/i,
      extractGroups: {
        animeName: 1,
        season: 2,
        episode: 4,
        language: 3,
        platform: 0
      },
      confidence: 95,
      description: "Format Voiranime avec numéro de saison"
    },

    // Short pattern: "SNK_S1_1_VF.mp4"
    {
      name: "Abbreviation Season",
      regex: /^([A-Z]+)_S(\d+)_(\d+)_([VF|VOSTFR]+)/i,
      extractGroups: {
        animeName: 1,
        season: 2,
        episode: 3,
        language: 4,
        platform: 0
      },
      confidence: 85,
      description: "Format abrégé avec saison (SNK_S1_1_VF)"
    },

    // Simple pattern with dots: "NS.52.VF.www.vostfree.com.mp4"
    {
      name: "Abbreviation Dot",
      regex: /^([A-Z]+)\.(\d+)\.(VF|VOSTFR)\..*$/i,
      extractGroups: {
        animeName: 1,
        season: 0,
        episode: 2,
        language: 3,
        platform: 0
      },
      confidence: 80,
      description: "Format abrégé avec points (NS.52.VF)"
    },

    // Generic anime title with episode: "Hataraku Maou sama.ts"
    {
      name: "Simple Title",
      regex: /^([^.]+?)(?:\s+(\d+))?\.(ts|mkv|mp4|avi)$/i,
      extractGroups: {
        animeName: 1,
        season: 0,
        episode: 2,
        language: 0,
        platform: 0
      },
      confidence: 60,
      description: "Titre simple avec extension"
    },

    // I Left My A-Rank pattern: "I Left My A-Rank Party to Help My Former Students Reach the Dungeon Depths! - I Left My A Rank Party to Help My Former Students Reach the Dungeon Depths - 06 VOSTFR - 06 - Voiranime.mp4"
    {
      name: "Long Title Voiranime",
      regex: /^(.{20,}?)\s*-\s*(.+?)\s*-\s*(\d+)\s*(VOSTFR|VF)\s*-\s*\3\s*-\s*Voiranime/i,
      extractGroups: {
        animeName: 1,
        season: 0,
        episode: 3,
        language: 4,
        platform: 0
      },
      confidence: 90,
      description: "Titres longs format Voiranime"
    }
  ];

  private static readonly EXCLUSION_PATTERNS = [
    // Musique
    /\b(music|beat|lofi|vlog|royalty\s+free|prod\s*\.\s*by)\b/i,
    /^(lukrembo|massobeats|RYLLZ)/i,
    /(type\s+beat|no\s+copyright)/i,
    
    // Tutoriels/Tech
    /\b(tutorial|dribbble|bliss\s+os|dual\s+boot)\b/i,
    
    // Courts clips sociaux
    /#(anime|edit|shorts|animeedit|animeshorts)/i,
    /\b(edit|clip|moment|flirts|jealous)\b/i,
    
    // Suspicious file extensions
    /\b(ui|reservation)\b/i,
    
    // Patterns de noms étranges
    /^[?]{4}\s/i, // Commence par "???? "
    /M[?]+\s+U[?]+/i // Pattern type "M????????????? U????????????????"
  ];

  private static readonly VIDEO_EXTENSIONS = [
    '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.ts', '.m4v'
  ];

  static classifyFile(filePath: string): FileClassification {
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();

    // Check if it's a video file
    if (!this.VIDEO_EXTENSIONS.includes(ext)) {
      return {
        file: fileName,
        type: 'other',
        confidence: 100,
        reason: `Extension ${ext} not supported`
      };
    }

    // Check exclusion patterns
    for (const pattern of this.EXCLUSION_PATTERNS) {
      if (pattern.test(fileName)) {
        const type = this.determineExclusionType(fileName);
        return {
          file: fileName,
          type,
          confidence: 90,
          reason: `Exclusion pattern detected: ${pattern.source}`
        };
      }
    }

    // Check anime patterns
    for (const animePattern of this.ANIME_PATTERNS) {
      if (animePattern.regex.test(fileName)) {
        return {
          file: fileName,
          type: 'anime',
          confidence: animePattern.confidence,
          reason: `Anime pattern detected: ${animePattern.name}`
        };
      }
    }

    // If no pattern matches
    return {
      file: fileName,
      type: 'unknown',
      confidence: 30,
      reason: 'No pattern recognized'
    };
  }

  private static determineExclusionType(fileName: string): 'music' | 'tutorial' | 'clip' | 'other' {
    if (/\b(music|beat|lofi|prod)\b/i.test(fileName)) return 'music';
    if (/\b(tutorial|dribbble|dual\s+boot)\b/i.test(fileName)) return 'tutorial';
    if (/#(anime|edit|shorts)|edit|clip|moment/i.test(fileName)) return 'clip';
    return 'other';
  }

  static parseAnimeFile(filePath: string): ParsedAnimeFile | null {
    const fileName = path.basename(filePath);
    const classification = this.classifyFile(filePath);

    // If not identified as anime, return null
    if (classification.type !== 'anime') {
      return null;
    }

    // Try each anime pattern
    for (const pattern of this.ANIME_PATTERNS) {
      const match = fileName.match(pattern.regex);
      if (match) {
        const animeName = this.cleanAnimeName(match[pattern.extractGroups.animeName] || '');
        const season = pattern.extractGroups.season && pattern.extractGroups.season > 0 ? 
          parseInt(match[pattern.extractGroups.season]) : undefined;
        const episode = parseInt(match[pattern.extractGroups.episode] || '1');
        const language = pattern.extractGroups.language && pattern.extractGroups.language > 0 ?
          match[pattern.extractGroups.language] as ('VF' | 'VOSTFR') : undefined;

        return {
          originalPath: filePath,
          fileName,
          animeName,
          season,
          episode,
          language,
          platform: 'Voiranime', // Détecté depuis les patterns
          confidence: pattern.confidence,
          pattern: pattern.name
        };
      }
    }

    return null;
  }

  private static cleanAnimeName(name: string): string {
    // Clean the anime name
    return name
      .trim()
      .replace(/[._-]+/g, ' ') // Replace separators with spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .replace(/^the\s+/i, '') // Remove "The" at the beginning
      .trim();
  }

  static getAnimeNameVariations(name: string): string[] {
    const variations = [name];
    
    // Add common variations
    const cleaned = this.cleanAnimeName(name);
    if (cleaned !== name) {
      variations.push(cleaned);
    }

    // Handle common abbreviations
    const abbreviationMap: { [key: string]: string[] } = {
      'SNK': ['Shingeki no Kyojin', 'Attack on Titan'],
      'NS': ['Naruto Shippuden', 'Naruto Shippuuden'],
      'HXH': ['Hunter x Hunter'],
      'AOT': ['Attack on Titan', 'Shingeki no Kyojin'],
      'MHA': ['My Hero Academia', 'Boku no Hero Academia']
    };

    if (abbreviationMap[name.toUpperCase()]) {
      variations.push(...abbreviationMap[name.toUpperCase()]);
    }

    return [...new Set(variations)]; // Remove duplicates
  }

  static batchClassifyFiles(filePaths: string[]): FileClassification[] {
    return filePaths.map(filePath => this.classifyFile(filePath));
  }

  static batchParseAnimeFiles(filePaths: string[]): ParsedAnimeFile[] {
    return filePaths
      .map(filePath => this.parseAnimeFile(filePath))
      .filter((parsed): parsed is ParsedAnimeFile => parsed !== null);
  }
}
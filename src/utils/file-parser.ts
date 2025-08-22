import path from "path";
import { ParsedAnimeFile, AnimePattern, FileClassification } from "../types/organize";

export class FileParser {
  private static readonly ANIME_PATTERNS: AnimePattern[] = [
    // VOIRANIME PATTERNS
    // Standard Voiranime: "Kamitsubaki City Under Construction - Kamitsubaki City Under Construction - 03 VOSTFR - 03 - Voiranime.mp4"
    {
      name: "Voiranime Standard",
      regex: /^(.+?)\s*(?:\(([VF|VOSTFR]+)\))?\s*-\s*(.+?)\s*-\s*(\d+)(?:x(\d+))?\s*(VF|VOSTFR)\s*-\s*\4\s*-\s*Voiranime/i,
      extractGroups: {
        animeName: 1,
        season: 0,
        episode: 4,
        language: 6,
        platform: 0
      },
      confidence: 95,
      description: "Standard Voiranime format"
    },

    // Voiranime with season: "Naruto- Shippuuden (VF) - Naruto Shippuden - 129x130 VF - 129x130 - Voiranime.mp4"
    {
      name: "Voiranime Season",
      regex: /^(.+?)\s+(\d+)\s*(?:\(([VF|VOSTFR]+)\))?\s*-\s*.+?\s*-\s*(\d+)(?:x(\d+))?\s*(VF|VOSTFR)\s*-\s*\4(?:x\5)?\s*-\s*Voiranime/i,
      extractGroups: {
        animeName: 1,
        season: 2,
        episode: 4,
        language: 6,
        platform: 0
      },
      confidence: 95,
      description: "Voiranime with season number"
    },

    // ANIME-SAMA PATTERNS
    // "A Couple of Cuckoos - Saison 2 - Anime-Sama - Streaming et catalogage d'animes et scans..ts"
    {
      name: "Anime-Sama",
      regex: /^(.+?)\s*-\s*Saison\s+(\d+)\s*-\s*Anime-Sama/i,
      extractGroups: {
        animeName: 1,
        season: 2,
        episode: 0,
        language: 0,
        platform: 0
      },
      confidence: 90,
      description: "Anime-Sama season format"
    },

    // ADKAMI PATTERNS  
    // "Kimi to Idol Precure♪ - Episode 28 vostfr - ADKami.mp4"
    {
      name: "ADKami",
      regex: /^(.+?)\s*-\s*Episode\s+(\d+)\s+(vostfr|vf)\s*-\s*ADKami/i,
      extractGroups: {
        animeName: 1,
        season: 0,
        episode: 2,
        language: 3,
        platform: 0
      },
      confidence: 90,
      description: "ADKami episode format"
    },

    // FRANIME PATTERNS
    // "Mushishi Special - Hihamukage S1 EP1 VOSTFR - FRAnime.fr #1 DE L'ANIME SANS PUB ET GRATUIT.mp4"
    {
      name: "FRAnime",
      regex: /^(.+?)\s*-\s*.*?S(\d+)\s*EP(\d+)\s+(VOSTFR|VF)\s*-\s*FRAnime/i,
      extractGroups: {
        animeName: 1,
        season: 2,
        episode: 3,
        language: 4,
        platform: 0
      },
      confidence: 90,
      description: "FRAnime S1 EP1 format"
    },

    // HIANIME PATTERNS
    // "Watch Kamitsubaki City Under Construction English Sub-Dub online Free on HiAnime.to.ts"
    {
      name: "HiAnime",
      regex: /^Watch\s+(.+?)\s+English\s+Sub-Dub\s+online\s+Free\s+on\s+HiAnime/i,
      extractGroups: {
        animeName: 1,
        season: 0,
        episode: 0,
        language: 0,
        platform: 0
      },
      confidence: 85,
      description: "HiAnime streaming format"
    },

    // NYAA TORRENT PATTERNS
    // "[shincaps] Black Clover - 129 (ANIMAX Asia 1920x1080 H264 MP2).ts"
    {
      name: "Nyaa Fansub",
      regex: /^\[([^\]]+)\]\s*(.+?)\s*-\s*(\d+)\s*(?:\([^)]*\))?/i,
      extractGroups: {
        animeName: 2,
        season: 0,
        episode: 3,
        language: 0,
        platform: 1
      },
      confidence: 85,
      description: "Nyaa fansub format with release group"
    },

    // "Black.Clover.S01.MULTi.1080p.BDRiP.x265-KAF"
    {
      name: "Nyaa Season Pack",
      regex: /^([^.]+(?:\.[^.]+)?)\.(S\d+)\./i,
      extractGroups: {
        animeName: 1,
        season: 2,
        episode: 0,
        language: 0,
        platform: 0
      },
      confidence: 80,
      description: "Nyaa season pack format"
    },

    // "[Tsundere-Raws] Black Clover - 169 VOSTFR [CR 720p].mkv"
    {
      name: "Nyaa CR VOSTFR",
      regex: /^\[([^\]]+)\]\s*(.+?)\s*-\s*(\d+)\s*(VOSTFR|VF)\s*\[([^\]]+)\]/i,
      extractGroups: {
        animeName: 2,
        season: 0,
        episode: 3,
        language: 4,
        platform: 1
      },
      confidence: 90,
      description: "Nyaa Crunchyroll VOSTFR format"
    },

    // SIMPLIFIED PATTERNS
    // "NarutoE01.mp4", "One Punch ManE01.mp4"
    {
      name: "Simple Episode",
      regex: /^(.+?)E(\d+)\.(mp4|mkv|avi|ts)$/i,
      extractGroups: {
        animeName: 1,
        season: 0,
        episode: 2,
        language: 0,
        platform: 0
      },
      confidence: 75,
      description: "Simple AnimeE01 format"
    },

    // "Shingeki no Kyojin 3E17 [VF].mp4", "I Left My AE09.mp4"
    {
      name: "Season Episode",
      regex: /^(.+?)\s*(\d+)E(\d+)(?:\s*\[([VF|VOSTFR]+)\])?\.(mp4|mkv|avi|ts)$/i,
      extractGroups: {
        animeName: 1,
        season: 2,
        episode: 3,
        language: 4,
        platform: 0
      },
      confidence: 80,
      description: "Season number + episode format"
    },

    // "Shingeki no Kyojin The Final SeasonE01.mp4"
    {
      name: "Named Season Episode",
      regex: /^(.+?)\s+((?:The\s+)?(?:Final\s+)?Season)E(\d+)\.(mp4|mkv|avi|ts)$/i,
      extractGroups: {
        animeName: 1,
        season: 0, // Named season, will be handled separately
        episode: 3,
        language: 0,
        platform: 0
      },
      confidence: 75,
      description: "Named season format (Final Season, etc.)"
    },

    // LEGACY PATTERNS (keeping existing ones for compatibility)
    // "SNK_S1_1_VF.mp4"
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
      description: "Abbreviated format with season (SNK_S1_1_VF)"
    },

    // "NS.52.VF.www.vostfree.com.mp4"
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
      description: "Abbreviated format with dots (NS.52.VF)"
    },

    // Generic fallback: "Hataraku Maou sama.ts"
    {
      name: "Generic Title",
      regex: /^([^.]+?)(?:\s+(\d+))?\.(ts|mkv|mp4|avi)$/i,
      extractGroups: {
        animeName: 1,
        season: 0,
        episode: 2,
        language: 0,
        platform: 0
      },
      confidence: 50,
      description: "Generic title with optional episode"
    }
  ];

  // REMOVED: No more exclusion patterns - let API decide what is anime or not

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

    // Try to parse as potential anime - if any pattern matches, classify as potential anime
    for (const animePattern of this.ANIME_PATTERNS) {
      if (animePattern.regex.test(fileName)) {
        return {
          file: fileName,
          type: 'anime', // Potential anime - API will validate
          confidence: animePattern.confidence,
          reason: `Potential anime pattern: ${animePattern.name}`
        };
      }
    }

    // If no anime pattern matches, still treat as potential anime
    // API will determine if it's actually an anime or not
    return {
      file: fileName,
      type: 'anime', // Let API decide - could be anime with unknown pattern
      confidence: 30,
      reason: 'Unknown pattern - will validate via API'
    };
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
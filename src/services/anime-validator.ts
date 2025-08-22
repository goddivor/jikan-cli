import { JikanApi } from "./jikan-api";
import { FileParser } from "../utils/file-parser";
import { ParsedAnimeFile, AnimeMatch } from "../types/organize";
import { AnimeData } from "../types/anime";

export class AnimeValidator {
  private static readonly CACHE = new Map<string, any>();
  private static readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  static async validateAndEnrichAnimeFile(parsedFile: ParsedAnimeFile): Promise<AnimeMatch> {
    const variations = FileParser.getAnimeNameVariations(parsedFile.animeName);
    let bestMatch: any = null;
    let bestScore = 0;
    let searchQuery = '';

    // Essayer chaque variation du nom
    for (const variation of variations) {
      try {
        const cacheKey = variation.toLowerCase().trim();
        let searchResult = this.getFromCache(cacheKey);

        if (!searchResult) {
          // Rechercher dans l'API Jikan
          const response = await JikanApi.searchAnime(variation, 5);
          searchResult = response.data || [];
          this.setCache(cacheKey, searchResult);
          
          // Petite pause pour respecter les limites de l'API
          await this.delay(200);
        }

        if (searchResult.length > 0) {
          const match = this.findBestAnimeMatch(variation, searchResult);
          if (!match) continue;
          const score = this.calculateMatchScore(parsedFile, match, variation);
          
          if (score > bestScore) {
            bestMatch = match;
            bestScore = score;
            searchQuery = variation;
          }
        }
      } catch (error) {
        console.warn(`Error during search for "${variation}":`, error);
      }
    }

    // Créer le résultat final
    const normalizedName = bestMatch ? 
      this.normalizeAnimeName(bestMatch) : 
      this.fallbackNormalizeName(parsedFile.animeName);

    const targetPath = this.generateTargetPath(parsedFile, normalizedName);

    const animeMatch: AnimeMatch = {
      parsedFile,
      jikanData: bestMatch ? {
        id: bestMatch.mal_id,
        title: bestMatch.title,
        title_english: (bestMatch as any).title_english,
        title_japanese: bestMatch.title_japanese,
        episodes: bestMatch.episodes,
        season: bestMatch.season,
        year: bestMatch.year
      } : undefined,
      normalizedName,
      targetPath
    };

    // Ajuster la confiance basée sur la validation API
    this.adjustConfidence(animeMatch, bestScore, searchQuery);

    return animeMatch;
  }

  private static findBestAnimeMatch(searchQuery: string, results: AnimeData[]): AnimeData | null {
    if (results.length === 0) return null;

    // Prioriser les correspondances exactes
    const exactMatch = results.find(anime => 
      anime.title.toLowerCase() === searchQuery.toLowerCase() ||
      (anime as any).title_english?.toLowerCase() === searchQuery.toLowerCase()
    );

    if (exactMatch) return exactMatch;

    // Sinon, prendre le premier résultat (généralement le plus pertinent)
    return results[0];
  }

  private static calculateMatchScore(
    parsedFile: ParsedAnimeFile, 
    animeData: AnimeData, 
    searchQuery: string
  ): number {
    let score = 0;

    if (!animeData) return 0;

    // Score basé sur la correspondance du titre
    const title = animeData.title.toLowerCase();
    const titleEnglish = (animeData as any).title_english?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    if (title === query || titleEnglish === query) {
      score += 50; // Correspondance exacte
    } else if (title.includes(query) || titleEnglish.includes(query)) {
      score += 30; // Correspondance partielle
    } else {
      score += 10; // Match trouvé via recherche
    }

    // Score basé sur la popularité/score
    if (animeData.score && animeData.score > 7) {
      score += 10;
    }

    // Vérifier la cohérence des épisodes si disponible
    if (animeData.episodes && parsedFile.episode) {
      if (parsedFile.episode <= animeData.episodes) {
        score += 15; // Épisode valide
      } else {
        score -= 10; // Épisode incohérent
      }
    }

    return score;
  }

  private static adjustConfidence(animeMatch: AnimeMatch, apiScore: number, searchQuery: string): void {
    const originalConfidence = animeMatch.parsedFile.confidence;
    let adjustment = 0;

    if (animeMatch.jikanData) {
      // Bonus pour validation API réussie
      if (apiScore >= 40) {
        adjustment = 20; // Très bonne correspondance
      } else if (apiScore >= 25) {
        adjustment = 10; // Bonne correspondance
      } else {
        adjustment = 5; // Correspondance faible
      }
    } else {
      // Pénalité pour échec de validation API
      adjustment = -15;
    }

    // Ajuster selon la longueur du nom (noms courts moins fiables)
    if (searchQuery.length <= 3) {
      adjustment -= 10;
    }

    animeMatch.parsedFile.confidence = Math.max(0, Math.min(100, originalConfidence + adjustment));
  }

  private static normalizeAnimeName(animeData: AnimeData): string {
    // Préférer le titre anglais s'il existe et est plus court/commun
    const english = (animeData as any).title_english;
    const original = animeData.title;

    if (english && english.length < original.length && !english.includes(':')) {
      return this.cleanAnimeName(english || original);
    }

    return this.cleanAnimeName(original);
  }

  private static fallbackNormalizeName(name: string): string {
    return this.cleanAnimeName(name);
  }

  private static cleanAnimeName(name: string): string {
    return name
      .trim()
      .replace(/[:<>"|?*]/g, '') // Characters forbidden in Windows file names
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static generateTargetPath(parsedFile: ParsedAnimeFile, normalizedName: string): string {
    let path = normalizedName;

    // Add season folder if necessary
    if (parsedFile.season && parsedFile.season > 1) {
      path += `/Season ${parsedFile.season}`;
    } else if (parsedFile.season === 1) {
      path += '/Season 1';
    }

    return path;
  }

  // Méthodes utilitaires pour le cache
  private static getFromCache(key: string): any {
    const cached = this.CACHE.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
      return cached.data;
    }
    return null;
  }

  private static setCache(key: string, data: any): void {
    this.CACHE.set(key, {
      data,
      timestamp: Date.now()
    });

    // Clean cache if it becomes too large
    if (this.CACHE.size > 100) {
      const oldestKey = this.CACHE.keys().next().value;
      if (oldestKey !== undefined) {
        this.CACHE.delete(oldestKey);
      }
    }
  }

  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Validation en lot pour de meilleures performances
  static async validateBatch(parsedFiles: ParsedAnimeFile[]): Promise<AnimeMatch[]> {
    const results: AnimeMatch[] = [];
    
    // Traiter par petits groupes pour éviter de surcharger l'API
    const batchSize = 3;
    for (let i = 0; i < parsedFiles.length; i += batchSize) {
      const batch = parsedFiles.slice(i, i + batchSize);
      const batchPromises = batch.map(file => this.validateAndEnrichAnimeFile(file));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.warn(`Error during batch processing ${i / batchSize + 1}:`, error);
        
        // Process individually in case of batch error
        for (const file of batch) {
          try {
            const result = await this.validateAndEnrichAnimeFile(file);
            results.push(result);
          } catch (individualError) {
            console.warn(`Error for file ${file.fileName}:`, individualError);
            
            // Create a fallback result
            results.push({
              parsedFile: { ...file, confidence: Math.max(0, file.confidence - 20) },
              normalizedName: this.fallbackNormalizeName(file.animeName),
              targetPath: this.generateTargetPath(file, this.fallbackNormalizeName(file.animeName))
            });
          }
        }
      }

      // Pause entre les lots
      await this.delay(500);
    }

    return results;
  }

  // Cache statistics for debugging
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.CACHE.size,
      keys: Array.from(this.CACHE.keys())
    };
  }

  // Clear cache manually
  static clearCache(): void {
    this.CACHE.clear();
  }
}
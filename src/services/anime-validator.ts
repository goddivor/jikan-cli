import chalk from "chalk";
import { JikanApi } from "./jikan-api";
import { FileParser } from "../utils/file-parser";
import { ParsedAnimeFile, AnimeMatch } from "../types/organize";
import { AnimeData } from "../types/anime";

export class AnimeValidator {
  private static readonly CACHE = new Map<string, any>();
  private static readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  static async validateAndEnrichAnimeFile(parsedFile: ParsedAnimeFile): Promise<AnimeMatch | null> {
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

    // If no anime found in API, this is not an anime file
    if (!bestMatch) {
      return null; // Not an anime - will be classified as "other"
    }

    // Créer le résultat final - API confirmed it's an anime
    const normalizedName = this.normalizeAnimeName(bestMatch);
    const targetPath = this.generateTargetPath(parsedFile, normalizedName, bestMatch);

    const animeMatch: AnimeMatch = {
      parsedFile,
      jikanData: {
        id: bestMatch.mal_id,
        title: bestMatch.title,
        title_english: (bestMatch as any).title_english,
        title_japanese: bestMatch.title_japanese,
        episodes: bestMatch.episodes,
        season: bestMatch.season,
        year: bestMatch.year
      },
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

  private static generateTargetPath(parsedFile: ParsedAnimeFile, normalizedName: string, jikanData?: any): string {
    let path = normalizedName;

    // If pattern detected a specific season, use it
    if (parsedFile.season && parsedFile.season > 0) {
      path += `/Season ${parsedFile.season}`;
    } else {
      // For "Simple Episode" patterns or no season detected:
      // Check if API indicates multiple seasons exist for this anime
      if (jikanData && jikanData.season) {
        // If API knows about seasons but we couldn't parse it from filename,
        // just put in main folder without season subfolder
        // User can organize manually later if needed
      }
      // No season folder - just put directly in anime folder
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
  static async validateBatch(parsedFiles: ParsedAnimeFile[]): Promise<{ animeMatches: AnimeMatch[], otherFiles: ParsedAnimeFile[] }> {
    const animeMatches: AnimeMatch[] = [];
    const otherFiles: ParsedAnimeFile[] = [];
    
    // Traiter par petits groupes pour éviter de surcharger l'API
    const batchSize = 3;
    for (let i = 0; i < parsedFiles.length; i += batchSize) {
      const batch = parsedFiles.slice(i, i + batchSize);
      const batchPromises = batch.map(file => this.validateAndEnrichAnimeFile(file));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        
        // Separate anime matches from non-anime files
        for (let j = 0; j < batchResults.length; j++) {
          const result = batchResults[j];
          if (result) {
            animeMatches.push(result);
          } else {
            otherFiles.push(batch[j]);
          }
        }
      } catch (error) {
        console.warn(`Error during batch processing ${i / batchSize + 1}:`, error);
        
        // Process individually in case of batch error
        for (const file of batch) {
          try {
            const result = await this.validateAndEnrichAnimeFile(file);
            if (result) {
              animeMatches.push(result);
            } else {
              otherFiles.push(file);
            }
          } catch (individualError) {
            console.warn(`Error for file ${file.fileName}:`, individualError);
            otherFiles.push(file); // Treat as non-anime if API fails
          }
        }
      }

      // Pause entre les lots
      await this.delay(500);
    }

    return { animeMatches, otherFiles };
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

  // Recover and group skipped files by anime name similarity
  static async recoverAndGroupSkippedFiles(
    skippedFiles: ParsedAnimeFile[], 
    existingMatches: AnimeMatch[]
  ): Promise<{ newMatches: AnimeMatch[], stillSkipped: ParsedAnimeFile[] }> {
    const newMatches: AnimeMatch[] = [];
    const stillSkipped: ParsedAnimeFile[] = [];
    
    // Group skipped files by detected anime name for batch processing
    const groupedByAnime = new Map<string, ParsedAnimeFile[]>();
    
    for (const file of skippedFiles) {
      const animeName = file.animeName.toLowerCase().trim();
      if (!groupedByAnime.has(animeName)) {
        groupedByAnime.set(animeName, []);
      }
      groupedByAnime.get(animeName)!.push(file);
    }

    console.log(chalk.blue('\n🔄 Re-validating selected files with API...'));
    
    // Process each anime group
    for (const [animeName, files] of groupedByAnime.entries()) {
      console.log(chalk.gray(`   Processing "${animeName}" (${files.length} file(s))`));
      
      try {
        // Try to validate the first file of the group
        const firstFile = files[0];
        const result = await this.validateAndEnrichAnimeFile(firstFile);
        
        if (result) {
          // API confirmed it's an anime - add the first file
          newMatches.push(result);
          
          // Check if there are other files in the group
          if (files.length > 1) {
            console.log(chalk.green(`   ✅ "${animeName}" confirmed as anime`));
            console.log(chalk.gray(`      Grouping ${files.length - 1} additional episode(s)...`));
            
            // Process remaining files with same anime identity
            for (let i = 1; i < files.length; i++) {
              const additionalFile = files[i];
              
              // Create match using same anime data but different episode
              const additionalMatch: AnimeMatch = {
                parsedFile: additionalFile,
                jikanData: result.jikanData,
                normalizedName: result.normalizedName,
                targetPath: this.generateTargetPath(additionalFile, result.normalizedName, result.jikanData)
              };
              
              // Adjust confidence based on grouping
              additionalMatch.parsedFile.confidence = Math.max(60, additionalFile.confidence + 15);
              
              newMatches.push(additionalMatch);
            }
          }
        } else {
          // API rejected - add all files to still skipped
          console.log(chalk.red(`   ❌ "${animeName}" not confirmed as anime`));
          stillSkipped.push(...files);
        }
      } catch (error) {
        console.warn(`Error processing group "${animeName}":`, error);
        stillSkipped.push(...files);
      }
      
      // Small delay between groups
      await this.delay(300);
    }
    
    return { newMatches, stillSkipped };
  }
}
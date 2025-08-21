import Fuse from 'fuse.js';
import { AnimeData, MangaData, AdvancedSearchOptions, GenreInfo } from '../types/anime';

export class AdvancedSearchUtils {
  // Common anime genres for validation and suggestion
  private static readonly COMMON_GENRES: GenreInfo[] = [
    { mal_id: 1, name: 'Action', type: 'genre' },
    { mal_id: 2, name: 'Adventure', type: 'genre' },
    { mal_id: 4, name: 'Comedy', type: 'genre' },
    { mal_id: 8, name: 'Drama', type: 'genre' },
    { mal_id: 10, name: 'Fantasy', type: 'genre' },
    { mal_id: 14, name: 'Horror', type: 'genre' },
    { mal_id: 22, name: 'Romance', type: 'genre' },
    { mal_id: 24, name: 'Sci-Fi', type: 'genre' },
    { mal_id: 36, name: 'Slice of Life', type: 'genre' },
    { mal_id: 37, name: 'Supernatural', type: 'genre' },
    { mal_id: 41, name: 'Thriller', type: 'genre' },
    { mal_id: 9, name: 'Ecchi', type: 'genre' },
    { mal_id: 26, name: 'School', type: 'genre' },
    { mal_id: 23, name: 'Historical', type: 'genre' },
    { mal_id: 18, name: 'Mecha', type: 'genre' },
    { mal_id: 19, name: 'Music', type: 'genre' },
    { mal_id: 7, name: 'Mystery', type: 'genre' },
    { mal_id: 20, name: 'Parody', type: 'genre' },
    { mal_id: 21, name: 'Samurai', type: 'genre' },
    { mal_id: 29, name: 'Space', type: 'genre' },
    { mal_id: 31, name: 'Super Power', type: 'genre' },
    { mal_id: 32, name: 'Vampire', type: 'genre' },
    { mal_id: 30, name: 'Sports', type: 'genre' },
    { mal_id: 38, name: 'Military', type: 'genre' },
    { mal_id: 39, name: 'Police', type: 'genre' },
    { mal_id: 40, name: 'Psychological', type: 'genre' }
  ];

  /**
   * Apply fuzzy search to anime results based on query
   */
  static applyFuzzySearch(
    animeList: AnimeData[], 
    query: string, 
    threshold: number = 0.4
  ): AnimeData[] {
    const fuseOptions = {
      keys: [
        { name: 'title', weight: 1.0 },
        { name: 'synopsis', weight: 0.3 },
        { name: 'genres.name', weight: 0.5 }
      ],
      threshold: threshold,
      includeScore: true,
      findAllMatches: true,
      ignoreLocation: true,
    };

    const fuse = new Fuse(animeList, fuseOptions);
    const results = fuse.search(query);
    
    return results.map(result => result.item);
  }

  /**
   * Filter anime by advanced search criteria
   */
  static filterAnime(animeList: AnimeData[], options: AdvancedSearchOptions): AnimeData[] {
    return animeList.filter(anime => {
      // Genre filtering
      if (options.genres && options.genres.length > 0) {
        const animeGenres = anime.genres?.map(g => g.name.toLowerCase()) || [];
        const hasRequiredGenre = options.genres.some(genre => 
          animeGenres.includes(genre.toLowerCase())
        );
        if (!hasRequiredGenre) return false;
      }

      // Genre exclusion
      if (options.excludeGenres && options.excludeGenres.length > 0) {
        const animeGenres = anime.genres?.map(g => g.name.toLowerCase()) || [];
        const hasExcludedGenre = options.excludeGenres.some(genre => 
          animeGenres.includes(genre.toLowerCase())
        );
        if (hasExcludedGenre) return false;
      }

      // Year filtering
      if (options.year && anime.year && anime.year !== options.year) {
        return false;
      }

      // Year range filtering
      if (options.yearRange && anime.year) {
        if (anime.year < options.yearRange.start || anime.year > options.yearRange.end) {
          return false;
        }
      }

      // Score filtering
      if (options.minScore && anime.score && anime.score < options.minScore) {
        return false;
      }

      if (options.maxScore && anime.score && anime.score > options.maxScore) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get genre suggestions based on partial input
   */
  static getGenreSuggestions(input: string): string[] {
    const normalizedInput = input.toLowerCase();
    return this.COMMON_GENRES
      .filter(genre => genre.name.toLowerCase().includes(normalizedInput))
      .map(genre => genre.name)
      .slice(0, 5);
  }

  /**
   * Validate genre names
   */
  static validateGenres(genres: string[]): { valid: string[], invalid: string[] } {
    const validGenres: string[] = [];
    const invalidGenres: string[] = [];
    const genreNames = this.COMMON_GENRES.map(g => g.name.toLowerCase());

    genres.forEach(genre => {
      const normalizedGenre = genre.toLowerCase();
      if (genreNames.includes(normalizedGenre)) {
        validGenres.push(genre);
      } else {
        invalidGenres.push(genre);
      }
    });

    return { valid: validGenres, invalid: invalidGenres };
  }

  /**
   * Get all available genres
   */
  static getAllGenres(): GenreInfo[] {
    return [...this.COMMON_GENRES];
  }

  /**
   * Parse genre string (comma-separated) into array
   */
  static parseGenreString(genreString: string): string[] {
    return genreString
      .split(',')
      .map(genre => genre.trim())
      .filter(genre => genre.length > 0);
  }

  /**
   * Create genre ID mapping for API queries
   */
  static getGenreIds(genreNames: string[]): number[] {
    const normalizedNames = genreNames.map(name => name.toLowerCase());
    return this.COMMON_GENRES
      .filter(genre => normalizedNames.includes(genre.name.toLowerCase()))
      .map(genre => genre.mal_id);
  }

  /**
   * Sort anime results by custom criteria
   */
  static sortAnime(animeList: AnimeData[], sortBy: string, order: 'asc' | 'desc' = 'desc'): AnimeData[] {
    const sortedList = [...animeList].sort((a, b) => {
      let comparison = 0;

      switch (sortBy.toLowerCase()) {
        case 'score':
          comparison = (a.score || 0) - (b.score || 0);
          break;
        case 'year':
          comparison = (a.year || 0) - (b.year || 0);
          break;
        case 'episodes':
          comparison = (a.episodes || 0) - (b.episodes || 0);
          break;
        case 'title':
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'popularity':
          // Assuming higher mal_id means less popular (newer entries)
          comparison = (b.mal_id || 0) - (a.mal_id || 0);
          break;
        default:
          comparison = (a.score || 0) - (b.score || 0);
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return sortedList;
  }

  /**
   * Filter manga by advanced search criteria
   */
  static filterManga(mangaList: MangaData[], options: AdvancedSearchOptions): MangaData[] {
    return mangaList.filter(manga => {
      // Genre filtering
      if (options.genres && options.genres.length > 0) {
        const mangaGenres = manga.genres?.map(g => g.name.toLowerCase()) || [];
        const hasRequiredGenre = options.genres.some(genre => 
          mangaGenres.includes(genre.toLowerCase())
        );
        if (!hasRequiredGenre) return false;
      }

      // Genre exclusion
      if (options.excludeGenres && options.excludeGenres.length > 0) {
        const mangaGenres = manga.genres?.map(g => g.name.toLowerCase()) || [];
        const hasExcludedGenre = options.excludeGenres.some(genre => 
          mangaGenres.includes(genre.toLowerCase())
        );
        if (hasExcludedGenre) return false;
      }

      // Year filtering
      if (options.year && manga.year && manga.year !== options.year) {
        return false;
      }

      // Year range filtering
      if (options.yearRange && manga.year) {
        if (manga.year < options.yearRange.start || manga.year > options.yearRange.end) {
          return false;
        }
      }

      // Score filtering
      if (options.minScore && manga.score && manga.score < options.minScore) {
        return false;
      }

      if (options.maxScore && manga.score && manga.score > options.maxScore) {
        return false;
      }

      return true;
    });
  }

  /**
   * Sort manga results by custom criteria
   */
  static sortManga(mangaList: MangaData[], sortBy: string, order: 'asc' | 'desc' = 'desc'): MangaData[] {
    const sortedList = [...mangaList].sort((a, b) => {
      let comparison = 0;

      switch (sortBy.toLowerCase()) {
        case 'score':
          comparison = (a.score || 0) - (b.score || 0);
          break;
        case 'year':
          comparison = (a.year || 0) - (b.year || 0);
          break;
        case 'chapters':
          comparison = (a.chapters || 0) - (b.chapters || 0);
          break;
        case 'volumes':
          comparison = (a.volumes || 0) - (b.volumes || 0);
          break;
        case 'title':
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'popularity':
          comparison = (b.mal_id || 0) - (a.mal_id || 0);
          break;
        default:
          comparison = (a.score || 0) - (b.score || 0);
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return sortedList;
  }

  /**
   * Extract year from aired date string
   */
  static extractYearFromAired(anime: AnimeData): number | undefined {
    if (anime.year) return anime.year;
    
    if (anime.aired?.from) {
      const year = new Date(anime.aired.from).getFullYear();
      return isNaN(year) ? undefined : year;
    }

    if (anime.aired?.string) {
      const yearMatch = anime.aired.string.match(/\b(19|20)\d{2}\b/);
      return yearMatch ? parseInt(yearMatch[0]) : undefined;
    }

    return undefined;
  }

  /**
   * Extract year from published date string for manga
   */
  static extractYearFromPublished(manga: MangaData): number | undefined {
    if (manga.year) return manga.year;
    
    if (manga.published?.from) {
      const year = new Date(manga.published.from).getFullYear();
      return isNaN(year) ? undefined : year;
    }

    if (manga.published?.string) {
      const yearMatch = manga.published.string.match(/\b(19|20)\d{2}\b/);
      return yearMatch ? parseInt(yearMatch[0]) : undefined;
    }

    return undefined;
  }
}
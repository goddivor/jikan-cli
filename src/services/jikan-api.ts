import { JikanResponse, JikanSingleResponse, AdvancedSearchOptions } from "../types/anime";

export class JikanApi {
  private static readonly BASE_URL = "https://api.jikan.moe/v4";

  static async searchAnime(
    query: string,
    limit: number,
    type?: string,
    status?: string,
    orderBy?: string,
    sortOrder?: string,
    advancedOptions?: AdvancedSearchOptions
  ): Promise<JikanResponse> {
    let url = `${this.BASE_URL}/anime?q=${encodeURIComponent(
      query
    )}&limit=${Math.min(limit * 3, 100)}`; // Get more results for filtering

    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }

    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }

    if (orderBy) {
      url += `&order_by=${encodeURIComponent(orderBy)}`;
    }

    if (sortOrder) {
      url += `&sort=${encodeURIComponent(sortOrder)}`;
    }

    // Add genre filtering to API call if provided
    if (advancedOptions?.genres && advancedOptions.genres.length > 0) {
      const genreIds = this.getGenreIds(advancedOptions.genres);
      if (genreIds.length > 0) {
        url += `&genres=${genreIds.join(',')}`;
      }
    }

    // Add year filtering to API call
    if (advancedOptions?.year) {
      url += `&start_date=${advancedOptions.year}-01-01&end_date=${advancedOptions.year}-12-31`;
    } else if (advancedOptions?.yearRange) {
      url += `&start_date=${advancedOptions.yearRange.start}-01-01&end_date=${advancedOptions.yearRange.end}-12-31`;
    }

    // Add score filtering
    if (advancedOptions?.minScore) {
      url += `&min_score=${advancedOptions.minScore}`;
    }

    if (advancedOptions?.maxScore) {
      url += `&max_score=${advancedOptions.maxScore}`;
    }

    const response = await fetch(url);
    return await response.json();
  }

  static async searchAnimeByGenre(
    genres: string[],
    limit: number = 25,
    excludeGenres?: string[],
    orderBy?: string,
    sortOrder?: string
  ): Promise<JikanResponse> {
    const genreIds = this.getGenreIds(genres);
    let url = `${this.BASE_URL}/anime?limit=${limit}`;

    if (genreIds.length > 0) {
      url += `&genres=${genreIds.join(',')}`;
    }

    if (excludeGenres && excludeGenres.length > 0) {
      const excludeIds = this.getGenreIds(excludeGenres);
      if (excludeIds.length > 0) {
        url += `&genres_exclude=${excludeIds.join(',')}`;
      }
    }

    if (orderBy) {
      url += `&order_by=${encodeURIComponent(orderBy)}`;
    }

    if (sortOrder) {
      url += `&sort=${encodeURIComponent(sortOrder)}`;
    }

    const response = await fetch(url);
    return await response.json();
  }

  private static getGenreIds(genreNames: string[]): number[] {
    const genreMap: { [key: string]: number } = {
      'action': 1, 'adventure': 2, 'comedy': 4, 'drama': 8,
      'fantasy': 10, 'horror': 14, 'romance': 22, 'sci-fi': 24,
      'slice of life': 36, 'supernatural': 37, 'thriller': 41,
      'ecchi': 9, 'school': 26, 'historical': 23, 'mecha': 18,
      'music': 19, 'mystery': 7, 'parody': 20, 'samurai': 21,
      'space': 29, 'super power': 31, 'vampire': 32, 'sports': 30,
      'military': 38, 'police': 39, 'psychological': 40
    };

    return genreNames
      .map(name => genreMap[name.toLowerCase()])
      .filter(id => id !== undefined);
  }

  static async getAnimeById(id: string): Promise<JikanSingleResponse> {
    const url = `${this.BASE_URL}/anime/${encodeURIComponent(id)}`;
    const response = await fetch(url);
    return await response.json();
  }

  static async getTopAnimes(
    limit: number,
    orderBy?: string,
    sortOrder?: string
  ): Promise<JikanResponse> {
    let url = `${this.BASE_URL}/top/anime?limit=${limit}`;

    if (orderBy) {
      url += `&order_by=${encodeURIComponent(orderBy)}`;
    }

    if (sortOrder) {
      url += `&sort=${encodeURIComponent(sortOrder)}`;
    }

    const response = await fetch(url);
    return await response.json();
  }

  static async getSeasonAnimes(
    year: string,
    season: string,
    orderBy?: string,
    sortOrder?: string
  ): Promise<JikanResponse> {
    let url = `${this.BASE_URL}/seasons/${year}/${season}`;

    if (orderBy) {
      url += `?order_by=${encodeURIComponent(orderBy)}`;
      if (sortOrder) {
        url += `&sort=${encodeURIComponent(sortOrder)}`;
      }
    } else if (sortOrder) {
      url += `?sort=${encodeURIComponent(sortOrder)}`;
    }

    const response = await fetch(url);
    return await response.json();
  }

  static async getRandomAnime(): Promise<JikanSingleResponse> {
    const url = `${this.BASE_URL}/random/anime`;
    const response = await fetch(url);
    return await response.json();
  }
}

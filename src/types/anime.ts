export interface AnimeData {
  title: string;
  year?: number;
  score?: number;
  episodes?: number;
  url: string;
  mal_id?: number;
  images?: {
    jpg?: {
      image_url?: string;
    };
  };
  synopsis?: string;
  type?: string;
  status?: string;
  aired?: {
    string?: string;
    from?: string;
    to?: string;
  };
  genres?: Array<{
    mal_id: number;
    name: string;
    type: string;
  }>;
  themes?: Array<{
    mal_id: number;
    name: string;
    type: string;
  }>;
  demographics?: Array<{
    mal_id: number;
    name: string;
    type: string;
  }>;
}

export interface AdvancedSearchOptions {
  genres?: string[];
  excludeGenres?: string[];
  year?: number;
  yearRange?: { start: number; end: number };
  minScore?: number;
  maxScore?: number;
  fuzzySearch?: boolean;
  fuzzyThreshold?: number;
}

export interface GenreInfo {
  mal_id: number;
  name: string;
  type: string;
}

export interface JikanResponse {
  data: AnimeData[];
}

export interface JikanSingleResponse {
  data: AnimeData;
}
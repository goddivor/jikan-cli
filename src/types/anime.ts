export interface AnimeData {
  title: string;
  year?: number;
  score?: number;
  episodes?: number;
  url: string;
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
  };
  genres?: Array<{
    name: string;
  }>;
}

export interface JikanResponse {
  data: AnimeData[];
}

export interface JikanSingleResponse {
  data: AnimeData;
}
import { JikanResponse, JikanSingleResponse } from '../types/anime.js';

export class JikanApi {
  private static readonly BASE_URL = 'https://api.jikan.moe/v4';

  static async searchAnime(query: string, limit: number): Promise<JikanResponse> {
    const url = `${this.BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=${limit}`;
    const response = await fetch(url);
    return await response.json();
  }

  static async getAnimeById(id: string): Promise<JikanSingleResponse> {
    const url = `${this.BASE_URL}/anime/${encodeURIComponent(id)}`;
    const response = await fetch(url);
    return await response.json();
  }

  static async getTopAnimes(limit: number): Promise<JikanResponse> {
    const url = `${this.BASE_URL}/top/anime?limit=${limit}`;
    const response = await fetch(url);
    return await response.json();
  }
}
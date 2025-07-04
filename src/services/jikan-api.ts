import { JikanResponse, JikanSingleResponse } from "../types/anime.js";

export class JikanApi {
  private static readonly BASE_URL = "https://api.jikan.moe/v4";

  static async searchAnime(
    query: string,
    limit: number,
    type?: string,
    status?: string
  ): Promise<JikanResponse> {
    let url = `${this.BASE_URL}/anime?q=${encodeURIComponent(
      query
    )}&limit=${limit}`;

    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }

    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }

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

  static async getSeasonAnimes(
    year: string,
    season: string
  ): Promise<JikanResponse> {
    const url = `${this.BASE_URL}/seasons/${year}/${season}`;
    const response = await fetch(url);
    return await response.json();
  }

  static async getRandomAnime(): Promise<JikanSingleResponse> {
    const url = `${this.BASE_URL}/random/anime`;
    const response = await fetch(url);
    return await response.json();
  }
}

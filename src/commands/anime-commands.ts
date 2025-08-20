import chalk from "chalk";
import { JikanApi } from "../services/jikan-api";
import { DisplayUtils } from "../utils/display";

export class AnimeCommands {
  static async searchAnime(
    query: string,
    limit: number,
    showDetails: boolean,
    type?: string,
    status?: string,
    orderBy?: string,
    sortOrder?: string
  ): Promise<void> {
    try {
      const data = await JikanApi.searchAnime(query, limit, type, status, orderBy, sortOrder);

      if (!data.data || data.data.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      DisplayUtils.displaySearchHeader(query, limit, type, status, orderBy, sortOrder);
      data.data.forEach((anime, index) => {
        DisplayUtils.displayAnime(anime, index, showDetails);
      });
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  static async getAnimeDetails(id: string): Promise<void> {
    try {
      const data = await JikanApi.getAnimeById(id);

      if (!data.data) {
        DisplayUtils.displayNoResults();
        return;
      }

      DisplayUtils.displayAnimeDetails(data.data);
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  static async showTopAnimes(
    limit: number,
    orderBy?: string,
    sortOrder?: string
  ): Promise<void> {
    try {
      const data = await JikanApi.getTopAnimes(limit, orderBy, sortOrder);

      if (!data.data || data.data.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      DisplayUtils.displayTopHeader(limit, orderBy, sortOrder);
      data.data.forEach((anime, index) => {
        DisplayUtils.displayAnime(anime, index, false);
      });
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  static async showSeasonAnimes(
    year: string,
    season: string,
    orderBy?: string,
    sortOrder?: string
  ): Promise<void> {
    try {
      const data = await JikanApi.getSeasonAnimes(year, season, orderBy, sortOrder);

      if (!data.data || data.data.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      DisplayUtils.displaySeasonHeader(year, season, orderBy, sortOrder);
      data.data.forEach((anime, index) => {
        DisplayUtils.displayAnime(anime, index, false);
      });
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  static async showRandomAnime(): Promise<void> {
    try {
      const data = await JikanApi.getRandomAnime();

      if (!data.data) {
        DisplayUtils.displayNoResults();
        return;
      }

      DisplayUtils.displayRandomHeader();
      DisplayUtils.displayAnimeDetails(data.data);
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }
}

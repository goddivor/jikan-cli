import chalk from 'chalk';
import { JikanApi } from '../services/jikan-api.js';
import { DisplayUtils } from '../utils/display.js';

export class AnimeCommands {
  static async searchAnime(query: string, limit: number, showDetails: boolean): Promise<void> {
    try {
      const data = await JikanApi.searchAnime(query, limit);

      if (!data.data || data.data.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      DisplayUtils.displaySearchHeader(query, limit);
      data.data.forEach((anime, index) => {
        DisplayUtils.displayAnime(anime, index, showDetails);
      });
    } catch (error) {
      DisplayUtils.displayError("Erreur lors de la requête :", error);
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
      DisplayUtils.displayError("Erreur lors de la requête :", error);
    }
  }

  static async showTopAnimes(limit: number): Promise<void> {
    try {
      const data = await JikanApi.getTopAnimes(limit);

      if (!data.data || data.data.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      DisplayUtils.displayTopHeader(limit);
      data.data.forEach((anime, index) => {
        DisplayUtils.displayAnime(anime, index, false);
      });
    } catch (error) {
      DisplayUtils.displayError("Erreur lors de la requête :", error);
    }
  }
}

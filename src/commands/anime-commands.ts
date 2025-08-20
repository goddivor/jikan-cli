import chalk from "chalk";
import { JikanApi } from "../services/jikan-api";
import { DisplayUtils } from "../utils/display";
import { InteractiveUtils } from "../utils/interactive";

export class AnimeCommands {
  static async searchAnime(
    query: string,
    limit: number,
    showDetails: boolean,
    type?: string,
    status?: string,
    orderBy?: string,
    sortOrder?: string,
    interactive?: boolean
  ): Promise<void> {
    try {
      const data = await JikanApi.searchAnime(query, limit, type, status, orderBy, sortOrder);

      if (!data.data || data.data.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      if (interactive) {
        InteractiveUtils.displayInteractiveHeader(query, data.data.length);
        await this.handleInteractiveMode(data.data);
      } else {
        DisplayUtils.displaySearchHeader(query, limit, type, status, orderBy, sortOrder);
        data.data.forEach((anime, index) => {
          DisplayUtils.displayAnime(anime, index, showDetails);
        });
      }
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
    sortOrder?: string,
    interactive?: boolean
  ): Promise<void> {
    try {
      const data = await JikanApi.getTopAnimes(limit, orderBy, sortOrder);

      if (!data.data || data.data.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      if (interactive) {
        InteractiveUtils.displayInteractiveHeader(`Top ${limit} anime`, data.data.length);
        await this.handleInteractiveMode(data.data);
      } else {
        DisplayUtils.displayTopHeader(limit, orderBy, sortOrder);
        data.data.forEach((anime, index) => {
          DisplayUtils.displayAnime(anime, index, false);
        });
      }
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  static async showSeasonAnimes(
    year: string,
    season: string,
    orderBy?: string,
    sortOrder?: string,
    interactive?: boolean
  ): Promise<void> {
    try {
      const data = await JikanApi.getSeasonAnimes(year, season, orderBy, sortOrder);

      if (!data.data || data.data.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      if (interactive) {
        InteractiveUtils.displayInteractiveHeader(`${season} ${year} season`, data.data.length);
        await this.handleInteractiveMode(data.data);
      } else {
        DisplayUtils.displaySeasonHeader(year, season, orderBy, sortOrder);
        data.data.forEach((anime, index) => {
          DisplayUtils.displayAnime(anime, index, false);
        });
      }
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

  private static async handleInteractiveMode(animeList: any[]): Promise<void> {
    let selectedAnime = await InteractiveUtils.selectAnime(animeList);

    while (selectedAnime) {
      console.clear();
      DisplayUtils.displayAnimeDetails(selectedAnime);

      const action = await InteractiveUtils.showActionMenu(selectedAnime);

      switch (action) {
        case "details":
          // Already shown above, just continue
          break;
        case "copy":
          console.log(chalk.green(`✅ URL copied: ${selectedAnime.url}`));
          break;
        case "back":
          console.clear();
          InteractiveUtils.displayInteractiveHeader();
          selectedAnime = await InteractiveUtils.selectAnime(animeList);
          break;
        case "exit":
        default:
          console.log(chalk.cyan("👋 Thanks for using jikan-cli!"));
          process.exit(0);
      }
    }
  }
}

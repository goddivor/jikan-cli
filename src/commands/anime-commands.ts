import chalk from "chalk";
import { JikanApi } from "../services/jikan-api";
import { DisplayUtils } from "../utils/display";
import { InteractiveUtils } from "../utils/interactive";
import { AdvancedSearchUtils } from "../utils/advanced-search";
import { AnimeData, AdvancedSearchOptions } from "../types/anime";

export class AnimeCommands {
  static async searchAnime(
    query: string,
    limit: number,
    showDetails: boolean,
    type?: string,
    status?: string,
    orderBy?: string,
    sortOrder?: string,
    interactive?: boolean,
    advancedOptions?: AdvancedSearchOptions
  ): Promise<void> {
    try {
      let data = await JikanApi.searchAnime(query, limit, type, status, orderBy, sortOrder, advancedOptions);
      let results = data.data || [];

      if (results.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      // Apply fuzzy search if enabled
      if (advancedOptions?.fuzzySearch && query) {
        results = AdvancedSearchUtils.applyFuzzySearch(results, query, advancedOptions.fuzzyThreshold);
      }

      // Apply client-side filtering for options not supported by API
      if (advancedOptions) {
        results = AdvancedSearchUtils.filterAnime(results, advancedOptions);
      }

      // Apply custom sorting if specified
      if (orderBy) {
        results = AdvancedSearchUtils.sortAnime(results, orderBy, sortOrder === 'asc' ? 'asc' : 'desc');
      }

      // Limit results to requested amount
      results = results.slice(0, limit);

      if (results.length === 0) {
        console.log(chalk.yellow("⚠️  No anime found matching your criteria"));
        return;
      }

      if (interactive) {
        InteractiveUtils.displayInteractiveHeader(query || "Advanced Search", results.length);
        await this.handleInteractiveMode(results);
      } else {
        DisplayUtils.displayAdvancedSearchHeader(query, limit, advancedOptions, type, status, orderBy, sortOrder);
        results.forEach((anime, index) => {
          DisplayUtils.displayAnime(anime, index, showDetails);
        });
      }
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  static async searchAnimeByGenres(
    genres: string[],
    limit: number,
    showDetails: boolean,
    excludeGenres?: string[],
    orderBy?: string,
    sortOrder?: string,
    interactive?: boolean,
    advancedOptions?: AdvancedSearchOptions
  ): Promise<void> {
    try {
      // Validate genres
      const { valid: validGenres, invalid: invalidGenres } = AdvancedSearchUtils.validateGenres(genres);
      
      if (invalidGenres.length > 0) {
        console.log(chalk.yellow(`⚠️  Invalid genres: ${invalidGenres.join(', ')}`));
        console.log(chalk.cyan("💡 Use --list-genres to see all available genres"));
        return;
      }

      const data = await JikanApi.searchAnimeByGenre(validGenres, limit * 2, excludeGenres, orderBy, sortOrder);
      let results = data.data || [];

      if (results.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      // Apply additional filtering
      if (advancedOptions) {
        results = AdvancedSearchUtils.filterAnime(results, advancedOptions);
      }

      // Apply custom sorting
      if (orderBy) {
        results = AdvancedSearchUtils.sortAnime(results, orderBy, sortOrder === 'asc' ? 'asc' : 'desc');
      }

      results = results.slice(0, limit);

      if (results.length === 0) {
        console.log(chalk.yellow("⚠️  No anime found matching your criteria"));
        return;
      }

      const genreQuery = `Genres: ${validGenres.join(', ')}`;
      if (interactive) {
        InteractiveUtils.displayInteractiveHeader(genreQuery, results.length);
        await this.handleInteractiveMode(results);
      } else {
        console.log(chalk.cyan(`🔍 ${genreQuery} (${results.length} results)`));
        if (excludeGenres && excludeGenres.length > 0) {
          console.log(chalk.red(`🚫 Excluding: ${excludeGenres.join(', ')}`));
        }
        console.log("");
        
        results.forEach((anime, index) => {
          DisplayUtils.displayAnime(anime, index, showDetails);
        });
      }
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  static showAllGenres(): void {
    const genres = AdvancedSearchUtils.getAllGenres();
    console.log(chalk.cyan("🎭 Available Anime Genres:"));
    console.log("");
    
    genres.forEach((genre, index) => {
      const color = index % 2 === 0 ? chalk.white : chalk.gray;
      console.log(color(`  ${genre.name}`));
    });
    
    console.log("");
    console.log(chalk.yellow("💡 Usage examples:"));
    console.log(chalk.cyan("  jikan-cli --genres \"Action,Fantasy\" --min-score 8.0"));
    console.log(chalk.cyan("  jikan-cli --genre-search \"Romance,Comedy\" --year-range 2020-2023"));
    console.log(chalk.cyan("  jikan-cli -s \"sword\" --exclude-genres \"Ecchi,Harem\""));
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

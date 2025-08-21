import chalk from "chalk";
import { JikanApi } from "../services/jikan-api";
import { DisplayUtils } from "../utils/display";
import { InteractiveUtils } from "../utils/interactive";
import { AdvancedSearchUtils } from "../utils/advanced-search";
import { MangaData, AdvancedSearchOptions } from "../types/anime";

export class MangaCommands {
  static async searchManga(
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
      let data = await JikanApi.searchManga(query, limit, type, status, orderBy, sortOrder, advancedOptions);
      let results = data.data || [];

      if (results.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      if (advancedOptions?.fuzzySearch && query) {
        results = AdvancedSearchUtils.applyFuzzySearch(results, query, advancedOptions.fuzzyThreshold);
      }

      if (advancedOptions) {
        results = AdvancedSearchUtils.filterManga(results, advancedOptions);
      }

      if (orderBy) {
        results = AdvancedSearchUtils.sortManga(results, orderBy, sortOrder === 'asc' ? 'asc' : 'desc');
      }

      results = results.slice(0, limit);

      if (results.length === 0) {
        console.log(chalk.yellow("⚠️  No manga found matching your criteria"));
        return;
      }

      if (interactive) {
        InteractiveUtils.displayInteractiveHeader(query || "Advanced Search", results.length, "manga");
        await this.handleInteractiveMode(results);
      } else {
        DisplayUtils.displayAdvancedSearchHeader(query, limit, advancedOptions, type, status, orderBy, sortOrder, "manga");
        results.forEach((manga, index) => {
          DisplayUtils.displayManga(manga, index, showDetails);
        });
      }
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  static async searchMangaByGenres(
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
      const { valid: validGenres, invalid: invalidGenres } = AdvancedSearchUtils.validateGenres(genres);
      
      if (invalidGenres.length > 0) {
        console.log(chalk.yellow(`⚠️  Invalid genres: ${invalidGenres.join(', ')}`));
        console.log(chalk.cyan("💡 Use --list-genres to see all available genres"));
        return;
      }

      const data = await JikanApi.searchMangaByGenre(validGenres, limit * 2, excludeGenres, orderBy, sortOrder);
      let results = data.data || [];

      if (results.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      if (advancedOptions) {
        results = AdvancedSearchUtils.filterManga(results, advancedOptions);
      }

      if (orderBy) {
        results = AdvancedSearchUtils.sortManga(results, orderBy, sortOrder === 'asc' ? 'asc' : 'desc');
      }

      results = results.slice(0, limit);

      if (results.length === 0) {
        console.log(chalk.yellow("⚠️  No manga found matching your criteria"));
        return;
      }

      const genreQuery = `Genres: ${validGenres.join(', ')}`;
      if (interactive) {
        InteractiveUtils.displayInteractiveHeader(genreQuery, results.length, "manga");
        await this.handleInteractiveMode(results);
      } else {
        console.log(chalk.cyan(`🔍 ${genreQuery} (${results.length} results)`));
        if (excludeGenres && excludeGenres.length > 0) {
          console.log(chalk.red(`🚫 Excluding: ${excludeGenres.join(', ')}`));
        }
        console.log("");
        
        results.forEach((manga, index) => {
          DisplayUtils.displayManga(manga, index, showDetails);
        });
      }
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  static showAllGenres(): void {
    const genres = AdvancedSearchUtils.getAllGenres();
    console.log(chalk.cyan("📚 Available Manga Genres:"));
    console.log("");
    
    genres.forEach((genre, index) => {
      const color = index % 2 === 0 ? chalk.white : chalk.gray;
      console.log(color(`  ${genre.name}`));
    });
    
    console.log("");
    console.log(chalk.yellow("💡 Usage examples:"));
    console.log(chalk.cyan("  jikan-cli --media manga --genres \"Action,Fantasy\" --min-score 8.0"));
    console.log(chalk.cyan("  jikan-cli --media manga --genre-search \"Romance,Comedy\" --year-range 2020-2023"));
    console.log(chalk.cyan("  jikan-cli -s \"dragon\" --media manga --exclude-genres \"Ecchi,Harem\""));
  }

  static async getMangaDetails(id: string): Promise<void> {
    try {
      const data = await JikanApi.getMangaById(id);

      if (!data.data) {
        DisplayUtils.displayNoResults();
        return;
      }

      DisplayUtils.displayMangaDetails(data.data);
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  static async showTopMangas(
    limit: number,
    orderBy?: string,
    sortOrder?: string,
    interactive?: boolean
  ): Promise<void> {
    try {
      const data = await JikanApi.getTopMangas(limit, orderBy, sortOrder);

      if (!data.data || data.data.length === 0) {
        DisplayUtils.displayNoResults();
        return;
      }

      if (interactive) {
        InteractiveUtils.displayInteractiveHeader(`Top ${limit} manga`, data.data.length, "manga");
        await this.handleInteractiveMode(data.data);
      } else {
        DisplayUtils.displayTopHeader(limit, orderBy, sortOrder, "manga");
        data.data.forEach((manga, index) => {
          DisplayUtils.displayManga(manga, index, false);
        });
      }
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  static async showRandomManga(): Promise<void> {
    try {
      const data = await JikanApi.getRandomManga();

      if (!data.data) {
        DisplayUtils.displayNoResults();
        return;
      }

      DisplayUtils.displayRandomHeader("manga");
      DisplayUtils.displayMangaDetails(data.data);
    } catch (error) {
      DisplayUtils.displayError("Error during request:", error);
    }
  }

  private static async handleInteractiveMode(mangaList: any[]): Promise<void> {
    let selectedManga = await InteractiveUtils.selectManga(mangaList);

    while (selectedManga) {
      console.clear();
      DisplayUtils.displayMangaDetails(selectedManga);

      const action = await InteractiveUtils.showActionMenu(selectedManga, "manga");

      switch (action) {
        case "details":
          break;
        case "copy":
          console.log(chalk.green(`✅ URL copied: ${selectedManga.url}`));
          break;
        case "back":
          console.clear();
          InteractiveUtils.displayInteractiveHeader("", 0, "manga");
          selectedManga = await InteractiveUtils.selectManga(mangaList);
          break;
        case "exit":
        default:
          console.log(chalk.cyan("👋 Thanks for using jikan-cli!"));
          process.exit(0);
      }
    }
  }
}
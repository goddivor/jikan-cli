import chalk from "chalk";
import { AnimeData, MangaData, AdvancedSearchOptions } from "../types/anime";

export class DisplayUtils {
  static displayAnime(
    anime: AnimeData,
    index: number,
    showDetails: boolean
  ): void {
    console.log(
      chalk.green(
        `${index + 1}. ${chalk.bold(anime.title)} (${
          anime.year || "Unknown year"
        })`
      )
    );
    console.log(
      `   ${chalk.magentaBright("Score")}: ${
        anime.score ?? "N/A"
      } | ${chalk.magentaBright("Episodes")}: ${anime.episodes ?? "N/A"}`
    );
    console.log(`   ${chalk.blueBright(anime.url)}`);
    console.log(
      `   🖼️ Image: ${chalk.gray(
        anime.images?.jpg?.image_url || "Not available"
      )}`
    );

    if (showDetails) {
      console.log(
        `   📝 ${chalk.yellowBright("Synopsis")}: ${
          anime.synopsis ?? "Not available"
        }`
      );
    }

    console.log(chalk.gray("---"));
  }

  static displayAnimeDetails(anime: AnimeData): void {
    console.log(
      chalk.cyanBright(`📋 Anime details: ${chalk.bold(anime.title)}\n`)
    );
    console.log(
      `${chalk.magentaBright("Synopsis")}: ${
        anime.synopsis ?? "Not available"
      }`
    );
    console.log(`${chalk.magentaBright("Type")}: ${anime.type ?? "N/A"}`);
    console.log(
      `${chalk.magentaBright("Episodes")}: ${anime.episodes ?? "N/A"}`
    );
    console.log(`${chalk.magentaBright("Score")}: ${anime.score ?? "N/A"}`);
    console.log(`${chalk.magentaBright("Status")}: ${anime.status ?? "N/A"}`);
    console.log(
      `${chalk.magentaBright("Aired")}: ${
        anime.aired?.string ?? "N/A"
      }`
    );
    console.log(
      `${chalk.magentaBright("Genres")}: ${
        anime.genres?.map((g) => g.name).join(", ") ?? "N/A"
      }`
    );
    console.log(
      `${chalk.magentaBright("Website")}: ${chalk.blueBright(anime.url)}`
    );
    console.log(
      `🖼️ Image: ${chalk.gray(
        anime.images?.jpg?.image_url || "Not available"
      )}`
    );
  }

  static displaySearchHeader(
    query: string,
    limit: number,
    type?: string,
    status?: string,
    orderBy?: string,
    sortOrder?: string
  ): void {
    let headerText = `🔍 Search results for "${chalk.bold(query)}" (${limit} max)`;

    const filters = [];
    if (type) filters.push(`type=${type}`);
    if (status) filters.push(`status=${status}`);
    if (orderBy) filters.push(`sort=${orderBy}`);
    if (sortOrder) filters.push(`order=${sortOrder}`);

    if (filters.length > 0) {
      headerText += ` - Filters: ${filters.join(", ")}`;
    }

    console.log(chalk.cyanBright(`${headerText}:\n`));
  }

  static displayTopHeader(
    limit: number,
    orderBy?: string,
    sortOrder?: string,
    mediaType: string = "anime"
  ): void {
    let headerText = `🏆 Top ${limit} ${mediaType}`;

    if (orderBy || sortOrder) {
      const sortInfo = [];
      if (orderBy) sortInfo.push(`sort=${orderBy}`);
      if (sortOrder) sortInfo.push(`order=${sortOrder}`);
      headerText += ` - ${sortInfo.join(", ")}`;
    }

    console.log(chalk.cyanBright(`${headerText}:\n`));
  }

  static displaySeasonHeader(
    year: string,
    season: string,
    orderBy?: string,
    sortOrder?: string
  ): void {
    let headerText = `🌸 Anime from ${chalk.bold(season)} ${chalk.bold(year)} season`;

    if (orderBy || sortOrder) {
      const sortInfo = [];
      if (orderBy) sortInfo.push(`sort=${orderBy}`);
      if (sortOrder) sortInfo.push(`order=${sortOrder}`);
      headerText += ` - ${sortInfo.join(", ")}`;
    }

    console.log(chalk.cyanBright(`${headerText}:\n`));
  }

  static displayManga(
    manga: MangaData,
    index: number,
    showDetails: boolean
  ): void {
    console.log(
      chalk.green(
        `${index + 1}. ${chalk.bold(manga.title)} (${
          manga.year || "Unknown year"
        })`
      )
    );
    console.log(
      `   ${chalk.magentaBright("Score")}: ${
        manga.score ?? "N/A"
      } | ${chalk.magentaBright("Chapters")}: ${manga.chapters ?? "N/A"} | ${chalk.magentaBright("Volumes")}: ${manga.volumes ?? "N/A"}`
    );
    console.log(`   ${chalk.blueBright(manga.url)}`);
    console.log(
      `   🖼️ Image: ${chalk.gray(
        manga.images?.jpg?.image_url || "Not available"
      )}`
    );

    if (showDetails) {
      console.log(
        `   📝 ${chalk.yellowBright("Synopsis")}: ${
          manga.synopsis ?? "Not available"
        }`
      );
    }

    console.log(chalk.gray("---"));
  }

  static displayMangaDetails(manga: MangaData): void {
    console.log(
      chalk.cyanBright(`📋 Manga details: ${chalk.bold(manga.title)}\n`)
    );
    console.log(
      `${chalk.magentaBright("Synopsis")}: ${
        manga.synopsis ?? "Not available"
      }`
    );
    console.log(`${chalk.magentaBright("Type")}: ${manga.type ?? "N/A"}`);
    console.log(
      `${chalk.magentaBright("Chapters")}: ${manga.chapters ?? "N/A"}`
    );
    console.log(
      `${chalk.magentaBright("Volumes")}: ${manga.volumes ?? "N/A"}`
    );
    console.log(`${chalk.magentaBright("Score")}: ${manga.score ?? "N/A"}`);
    console.log(`${chalk.magentaBright("Status")}: ${manga.status ?? "N/A"}`);
    console.log(
      `${chalk.magentaBright("Published")}: ${
        manga.published?.string ?? "N/A"
      }`
    );
    console.log(
      `${chalk.magentaBright("Genres")}: ${
        manga.genres?.map((g) => g.name).join(", ") ?? "N/A"
      }`
    );
    console.log(
      `${chalk.magentaBright("Website")}: ${chalk.blueBright(manga.url)}`
    );
    console.log(
      `🖼️ Image: ${chalk.gray(
        manga.images?.jpg?.image_url || "Not available"
      )}`
    );
  }

  static displayRandomHeader(mediaType: string = "anime"): void {
    console.log(chalk.cyanBright(`🎲 Random ${mediaType}:\n`));
  }

  static displayError(message: string, error?: any): void {
    console.error(chalk.red(`❌ ${message}`), error || "");
  }

  static displayNoResults(): void {
    console.log(chalk.yellowBright("😢 No results found."));
  }

  static displayAdvancedSearchHeader(
    query: string | undefined,
    limit: number,
    advancedOptions?: AdvancedSearchOptions,
    type?: string,
    status?: string,
    orderBy?: string,
    sortOrder?: string,
    mediaType: string = "anime"
  ): void {
    let headerText = query 
      ? `🔍 Advanced ${mediaType} search for "${chalk.bold(query)}" (${limit} max)`
      : `🔍 Advanced ${mediaType} search (${limit} max)`;

    const filters = [];
    if (type) filters.push(`type=${type}`);
    if (status) filters.push(`status=${status}`);
    if (orderBy) filters.push(`sort=${orderBy}`);
    if (sortOrder) filters.push(`order=${sortOrder}`);

    if (advancedOptions) {
      if (advancedOptions.genres?.length) {
        filters.push(`genres=${advancedOptions.genres.join(',')}`);
      }
      if (advancedOptions.excludeGenres?.length) {
        filters.push(`exclude=${advancedOptions.excludeGenres.join(',')}`);
      }
      if (advancedOptions.year) {
        filters.push(`year=${advancedOptions.year}`);
      }
      if (advancedOptions.yearRange) {
        filters.push(`years=${advancedOptions.yearRange.start}-${advancedOptions.yearRange.end}`);
      }
      if (advancedOptions.minScore !== undefined) {
        filters.push(`min-score=${advancedOptions.minScore}`);
      }
      if (advancedOptions.maxScore !== undefined) {
        filters.push(`max-score=${advancedOptions.maxScore}`);
      }
      if (advancedOptions.fuzzySearch) {
        filters.push(`fuzzy=${advancedOptions.fuzzyThreshold || 0.4}`);
      }
    }

    if (filters.length > 0) {
      headerText += ` - Filters: ${filters.join(", ")}`;
    }

    console.log(chalk.cyanBright(`${headerText}:\n`));
  }

  static displayUsage(): void {
    console.log(chalk.cyan("🎌 Jikan CLI - For detailed help, use: --help"));
    console.log(chalk.redBright(""));
    console.log(
      chalk.redBright(
        '❌ Usage: jikan-cli -s "anime name" [-l limit] [--details] [--interactive]'
      )
    );
    console.log(chalk.redBright("   or: jikan-cli --genre-search \"action,fantasy\""));
    console.log(chalk.redBright("   or: jikan-cli -i/--id anime_id"));
    console.log(chalk.redBright("   or: jikan-cli -t/--top [n] [--interactive]"));
    console.log(chalk.redBright("   or: jikan-cli -ss/--season year season"));
    console.log(chalk.redBright("   or: jikan-cli -r/--random"));
    console.log(chalk.redBright("   or: jikan-cli --list-genres"));
    console.log(chalk.redBright(""));
    console.log(chalk.yellow("💡 Examples:"));
    console.log(chalk.cyan('  jikan-cli -s "naruto" --fuzzy --genres "action"'));
    console.log(chalk.cyan('  jikan-cli --genre-search "romance,comedy" --min-score 8.0'));
    console.log(chalk.cyan('  jikan-cli -s "dragon" --year-range 2010-2020 --exclude-genres "ecchi"'));
  }
}

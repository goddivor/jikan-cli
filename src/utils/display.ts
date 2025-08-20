import chalk from "chalk";
import { AnimeData } from "../types/anime";

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
    sortOrder?: string
  ): void {
    let headerText = `🏆 Top ${limit} anime`;

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

  static displayRandomHeader(): void {
    console.log(chalk.cyanBright(`🎲 Random anime:\n`));
  }

  static displayError(message: string, error?: any): void {
    console.error(chalk.red(`❌ ${message}`), error || "");
  }

  static displayNoResults(): void {
    console.log(chalk.yellowBright("😢 No results found."));
  }

  static displayUsage(): void {
    console.log(
      chalk.redBright(
        '❌ Usage: jikan-cli -s "anime name" [-l limit] [--details] [--type type] [--status status] [--sort criteria] [--order asc/desc]'
      )
    );
    console.log(chalk.redBright("   or: jikan-cli -i/--id anime_id"));
    console.log(chalk.redBright("   or: jikan-cli -t/--top [n] [--sort criteria] [--order asc/desc]"));
    console.log(chalk.redBright("   or: jikan-cli -ss/--season year season [--sort criteria] [--order asc/desc]"));
    console.log(chalk.redBright("   or: jikan-cli -r/--random"));
    console.log(chalk.redBright(""));
    console.log(chalk.redBright("   Available filters:"));
    console.log(
      chalk.redBright("   --type: tv, movie, ova, special, ona, music")
    );
    console.log(chalk.redBright("   --status: airing, completed, upcoming"));
    console.log(chalk.redBright(""));
    console.log(chalk.redBright("   Available sorting options:"));
    console.log(chalk.redBright("   --sort: score, members, start_date, title, rank, popularity"));
    console.log(chalk.redBright("   --order: asc (ascending), desc (descending, default)"));
  }
}

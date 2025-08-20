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
          anime.year || "Année inconnue"
        })`
      )
    );
    console.log(
      `   ${chalk.magentaBright("Score")} : ${
        anime.score ?? "N/A"
      } | ${chalk.magentaBright("Épisodes")} : ${anime.episodes ?? "N/A"}`
    );
    console.log(`   ${chalk.blueBright(anime.url)}`);
    console.log(
      `   🖼️ Image : ${chalk.gray(
        anime.images?.jpg?.image_url || "Non disponible"
      )}`
    );

    if (showDetails) {
      console.log(
        `   📝 ${chalk.yellowBright("Synopsis")} : ${
          anime.synopsis ?? "Non disponible"
        }`
      );
    }

    console.log(chalk.gray("---"));
  }

  static displayAnimeDetails(anime: AnimeData): void {
    console.log(
      chalk.cyanBright(`📋 Détails pour l'anime : ${chalk.bold(anime.title)}\n`)
    );
    console.log(
      `${chalk.magentaBright("Synopsis")} : ${
        anime.synopsis ?? "Non disponible"
      }`
    );
    console.log(`${chalk.magentaBright("Type")} : ${anime.type ?? "N/A"}`);
    console.log(
      `${chalk.magentaBright("Episodes")} : ${anime.episodes ?? "N/A"}`
    );
    console.log(`${chalk.magentaBright("Score")} : ${anime.score ?? "N/A"}`);
    console.log(`${chalk.magentaBright("Statut")} : ${anime.status ?? "N/A"}`);
    console.log(
      `${chalk.magentaBright("Début diffusion")} : ${
        anime.aired?.string ?? "N/A"
      }`
    );
    console.log(
      `${chalk.magentaBright("Genres")} : ${
        anime.genres?.map((g) => g.name).join(", ") ?? "N/A"
      }`
    );
    console.log(
      `${chalk.magentaBright("Site")} : ${chalk.blueBright(anime.url)}`
    );
    console.log(
      `🖼️ Image : ${chalk.gray(
        anime.images?.jpg?.image_url || "Non disponible"
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
    let headerText = `🔍 Résultats pour "${chalk.bold(query)}" (${limit} max)`;

    const filters = [];
    if (type) filters.push(`type=${type}`);
    if (status) filters.push(`status=${status}`);
    if (orderBy) filters.push(`tri=${orderBy}`);
    if (sortOrder) filters.push(`ordre=${sortOrder}`);

    if (filters.length > 0) {
      headerText += ` - Filtres : ${filters.join(", ")}`;
    }

    console.log(chalk.cyanBright(`${headerText} :\n`));
  }

  static displayTopHeader(
    limit: number,
    orderBy?: string,
    sortOrder?: string
  ): void {
    let headerText = `🏆 Top ${limit} des animés`;

    if (orderBy || sortOrder) {
      const sortInfo = [];
      if (orderBy) sortInfo.push(`tri=${orderBy}`);
      if (sortOrder) sortInfo.push(`ordre=${sortOrder}`);
      headerText += ` - ${sortInfo.join(", ")}`;
    }

    console.log(chalk.cyanBright(`${headerText} :\n`));
  }

  static displaySeasonHeader(
    year: string,
    season: string,
    orderBy?: string,
    sortOrder?: string
  ): void {
    let headerText = `🌸 Animés de la saison ${chalk.bold(season)} ${chalk.bold(year)}`;

    if (orderBy || sortOrder) {
      const sortInfo = [];
      if (orderBy) sortInfo.push(`tri=${orderBy}`);
      if (sortOrder) sortInfo.push(`ordre=${sortOrder}`);
      headerText += ` - ${sortInfo.join(", ")}`;
    }

    console.log(chalk.cyanBright(`${headerText} :\n`));
  }

  static displayRandomHeader(): void {
    console.log(chalk.cyanBright(`🎲 Anime aléatoire :\n`));
  }

  static displayError(message: string, error?: any): void {
    console.error(chalk.red(`❌ ${message}`), error || "");
  }

  static displayNoResults(): void {
    console.log(chalk.yellowBright("😢 Aucun résultat trouvé."));
  }

  static displayUsage(): void {
    console.log(
      chalk.redBright(
        '❌ Usage : jikan-cli -s "nom de l\'anime" [-l nombre_de_resultats] [--details] [--type type] [--status status] [--sort critère] [--order asc/desc]'
      )
    );
    console.log(chalk.redBright("   ou : jikan-cli -i/--id id_de_l_anime"));
    console.log(chalk.redBright("   ou : jikan-cli -t/--top [n] [--sort critère] [--order asc/desc]"));
    console.log(chalk.redBright("   ou : jikan-cli -ss/--season année saison [--sort critère] [--order asc/desc]"));
    console.log(chalk.redBright("   ou : jikan-cli -r/--random"));
    console.log(chalk.redBright(""));
    console.log(chalk.redBright("   Filtres disponibles :"));
    console.log(
      chalk.redBright("   --type : tv, movie, ova, special, ona, music")
    );
    console.log(chalk.redBright("   --status : airing, completed, upcoming"));
    console.log(chalk.redBright(""));
    console.log(chalk.redBright("   Options de tri disponibles :"));
    console.log(chalk.redBright("   --sort : score, members, start_date, title, rank, popularity"));
    console.log(chalk.redBright("   --order : asc (croissant), desc (décroissant, défaut)"));
  }
}

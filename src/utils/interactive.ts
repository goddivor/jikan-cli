import inquirer from "inquirer";
import { AnimeData, MangaData } from "../types/anime";
import { ParsedAnimeFile } from "../types/organize";
import { DisplayUtils } from "./display";
import chalk from "chalk";

export interface InteractiveChoice {
  name: string;
  value: AnimeData | MangaData | string;
  short?: string;
}

export class InteractiveUtils {
  static async selectAnime(animeList: AnimeData[]): Promise<AnimeData | null> {
    if (animeList.length === 0) {
      DisplayUtils.displayNoResults();
      return null;
    }

    const choices: InteractiveChoice[] = animeList.map((anime, index) => ({
      name: this.formatAnimeChoice(anime, index),
      value: anime,
      short: anime.title,
    }));

    // Add navigation options
    choices.push(
      { name: chalk.gray("───────────────────────────"), value: "separator" },
      { name: chalk.yellow("🔙 Go back"), value: "back" },
      { name: chalk.red("❌ Exit"), value: "exit" }
    );

    try {
      const answer = await inquirer.prompt([
        {
          type: "list",
          name: "selectedAnime",
          message: "📋 Select an anime to view details:",
          choices,
          pageSize: 15,
        },
      ]);

      const selection = answer.selectedAnime;

      if (selection === "back") {
        return null;
      }

      if (selection === "exit") {
        console.log(chalk.cyan("👋 Thanks for using jikan-cli!"));
        process.exit(0);
      }

      if (selection === "separator") {
        return this.selectAnime(animeList); // Re-show the menu
      }

      return selection as AnimeData;
    } catch (error) {
      // User pressed Ctrl+C
      console.log(chalk.cyan("\n👋 Thanks for using jikan-cli!"));
      process.exit(0);
    }
  }

  static async confirmAction(message: string): Promise<boolean> {
    try {
      const answer = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirmed",
          message,
          default: false,
        },
      ]);

      return answer.confirmed;
    } catch (error) {
      return false;
    }
  }

  static async selectManga(mangaList: MangaData[]): Promise<MangaData | null> {
    if (mangaList.length === 0) {
      DisplayUtils.displayNoResults();
      return null;
    }

    const choices: InteractiveChoice[] = mangaList.map((manga, index) => ({
      name: this.formatMangaChoice(manga, index),
      value: manga,
      short: manga.title,
    }));

    choices.push(
      { name: chalk.gray("───────────────────────────"), value: "separator" },
      { name: chalk.yellow("🔙 Go back"), value: "back" },
      { name: chalk.red("❌ Exit"), value: "exit" }
    );

    try {
      const answer = await inquirer.prompt([
        {
          type: "list",
          name: "selectedManga",
          message: "📋 Select a manga to view details:",
          choices,
          pageSize: 15,
        },
      ]);

      const selection = answer.selectedManga;

      if (selection === "back") {
        return null;
      }

      if (selection === "exit") {
        console.log(chalk.cyan("👋 Thanks for using jikan-cli!"));
        process.exit(0);
      }

      if (selection === "separator") {
        return this.selectManga(mangaList);
      }

      return selection as MangaData;
    } catch (error) {
      console.log(chalk.cyan("\n👋 Thanks for using jikan-cli!"));
      process.exit(0);
    }
  }

  static async showActionMenu(item: AnimeData | MangaData, mediaType: string = "anime"): Promise<string> {
    try {
      const answer = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: `What would you like to do with "${item.title}"?`,
          choices: [
            { name: "📋 View full details", value: "details" },
            { name: "🔗 Copy URL to clipboard", value: "copy" },
            { name: "🔙 Go back to list", value: "back" },
            { name: "❌ Exit", value: "exit" },
          ],
        },
      ]);

      return answer.action;
    } catch (error) {
      return "exit";
    }
  }

  private static formatAnimeChoice(anime: AnimeData, index: number): string {
    const title = chalk.bold(anime.title);
    const year = anime.year ? chalk.dim(`(${anime.year})`) : chalk.dim("(Unknown year)");
    const score = anime.score ? chalk.green(`⭐ ${anime.score}`) : chalk.gray("⭐ N/A");
    const episodes = anime.episodes ? chalk.blue(`📺 ${anime.episodes}ep`) : chalk.gray("📺 N/A");
    
    return `${index + 1}. ${title} ${year} - ${score} ${episodes}`;
  }

  private static formatMangaChoice(manga: MangaData, index: number): string {
    const title = chalk.bold(manga.title);
    const year = manga.year ? chalk.dim(`(${manga.year})`) : chalk.dim("(Unknown year)");
    const score = manga.score ? chalk.green(`⭐ ${manga.score}`) : chalk.gray("⭐ N/A");
    const chapters = manga.chapters ? chalk.blue(`📖 ${manga.chapters}ch`) : chalk.gray("📖 N/A");
    const volumes = manga.volumes ? chalk.magenta(`📚 ${manga.volumes}vol`) : chalk.gray("📚 N/A");
    
    return `${index + 1}. ${title} ${year} - ${score} ${chapters} ${volumes}`;
  }

  static displayInteractiveHeader(query?: string, total?: number, mediaType: string = "anime"): void {
    const emoji = mediaType === "manga" ? "📚" : "🎮";
    console.log(chalk.cyanBright(`${emoji} Interactive Mode Enabled\n`));
    if (query) {
      console.log(chalk.dim(`Search: "${query}" | Found: ${total || 0} results`));
      console.log(chalk.dim("Use ↑↓ arrows to navigate, Enter to select\n"));
    }
  }

  static async selectSkippedFilesToRecover(skippedFiles: ParsedAnimeFile[]): Promise<ParsedAnimeFile[]> {
    if (skippedFiles.length === 0) {
      return [];
    }

    console.log(chalk.cyan('\n🔄 RECOVER SKIPPED FILES'));
    console.log(chalk.cyan('═'.repeat(40)));
    console.log(chalk.gray('Select files you believe should be anime and want to re-validate:\n'));

    const choices = skippedFiles.map((file, index) => ({
      name: this.formatSkippedFileChoice(file, index),
      value: file,
      checked: false
    }));

    // Add control options
    choices.push(
      { name: chalk.gray("───────────────────────────"), value: null as any, checked: false },
      { name: chalk.yellow("🔙 Continue without recovering"), value: null as any, checked: false }
    );

    try {
      const answer = await inquirer.prompt([
        {
          type: "checkbox",
          name: "selectedFiles",
          message: "📋 Select files to recover (use Space to select, Enter to confirm):",
          choices,
          pageSize: 15,
        },
      ]);

      // Filter out control options
      const selectedFiles = answer.selectedFiles.filter((item: any) => 
        item !== null && typeof item === 'object' && item.fileName
      );

      if (selectedFiles.length > 0) {
        const confirm = await this.confirmAction(
          `Re-validate ${selectedFiles.length} selected file(s) with Jikan API?`
        );
        
        if (confirm) {
          return selectedFiles;
        }
      }

      return [];
    } catch (error) {
      console.log(chalk.cyan("\n👋 Operation cancelled"));
      return [];
    }
  }

  static async selectAnimeForGrouping(
    recoveredFile: ParsedAnimeFile, 
    availableAnimes: string[]
  ): Promise<string | null> {
    if (availableAnimes.length === 0) {
      return null;
    }

    console.log(chalk.cyan(`\n📂 GROUP WITH EXISTING ANIME`));
    console.log(chalk.gray(`File: ${recoveredFile.fileName}`));
    console.log(chalk.gray(`Detected as: ${recoveredFile.animeName}\n`));

    const choices = availableAnimes.map((animeName, index) => ({
      name: `📁 ${animeName}`,
      value: animeName
    }));

    // Add options
    choices.push(
      { name: chalk.gray("───────────────────────────"), value: "separator" },
      { name: chalk.green("➕ Create new anime folder"), value: "new" },
      { name: chalk.yellow("⏭️ Skip this file"), value: "skip" }
    );

    try {
      const answer = await inquirer.prompt([
        {
          type: "list",
          name: "selectedAnime",
          message: "📋 Group this episode with which anime?",
          choices,
          pageSize: 12,
        },
      ]);

      const selection = answer.selectedAnime;

      if (selection === "separator") {
        return this.selectAnimeForGrouping(recoveredFile, availableAnimes);
      }

      if (selection === "skip") {
        return null;
      }

      if (selection === "new") {
        return "NEW_FOLDER";
      }

      return selection;
    } catch (error) {
      return null;
    }
  }

  private static formatSkippedFileChoice(file: ParsedAnimeFile, index: number): string {
    const fileName = chalk.bold(file.fileName);
    const animeName = chalk.cyan(file.animeName);
    const confidence = file.confidence >= 60 ? 
      chalk.yellow(`${file.confidence}%`) : 
      chalk.red(`${file.confidence}%`);
    const episode = file.episode ? chalk.blue(`E${file.episode}`) : chalk.gray('E?');
    
    return `${index + 1}. ${fileName}\n   └─ ${animeName} ${episode} (${confidence})`;
  }
}
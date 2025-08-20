import inquirer from "inquirer";
import { AnimeData } from "../types/anime";
import { DisplayUtils } from "./display";
import chalk from "chalk";

export interface InteractiveChoice {
  name: string;
  value: AnimeData | string;
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

  static async showActionMenu(anime: AnimeData): Promise<string> {
    try {
      const answer = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: `What would you like to do with "${anime.title}"?`,
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

  static displayInteractiveHeader(query?: string, total?: number): void {
    console.log(chalk.cyanBright("🎮 Interactive Mode Enabled\n"));
    if (query) {
      console.log(chalk.dim(`Search: "${query}" | Found: ${total || 0} results`));
      console.log(chalk.dim("Use ↑↓ arrows to navigate, Enter to select\n"));
    }
  }
}
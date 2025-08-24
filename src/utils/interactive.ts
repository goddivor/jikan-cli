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

  /**
   * Interactive confidence adjustment for anime matches
   * Allows users to manually adjust confidence scores for individual files
   */
  static async adjustConfidenceInteractive(matches: any[]): Promise<{newThreshold: number, adjustedMatches: any[]}> {
    console.log(chalk.cyan('\n⚙️  CONFIDENCE ADJUSTMENT'));
    console.log(chalk.cyan('═'.repeat(40)));
    console.log(chalk.gray('Adjust confidence settings to fine-tune anime detection\n'));

    // Show current statistics
    const currentThreshold = 70; // Default threshold
    const lowConfidenceCount = matches.filter(m => m.parsedFile.confidence < currentThreshold).length;
    const highConfidenceCount = matches.filter(m => m.parsedFile.confidence >= currentThreshold).length;
    
    console.log(chalk.blue(`📊 Current Statistics (threshold: ${currentThreshold}%):`));
    console.log(chalk.green(`   ✅ High confidence: ${highConfidenceCount} files`));
    console.log(chalk.yellow(`   ⚠️  Low confidence: ${lowConfidenceCount} files\n`));

    // Main adjustment menu
    const adjustmentChoice = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Choose confidence adjustment method:",
        choices: [
          { name: "🎯 Adjust global threshold", value: "threshold" },
          { name: "📝 Review and adjust individual files", value: "individual" },
          { name: "📊 View confidence distribution", value: "stats" },
          { name: "✅ Keep current settings", value: "keep" }
        ],
      }
    ]);

    switch (adjustmentChoice.action) {
      case "threshold":
        return await this.adjustGlobalThreshold(matches, currentThreshold);
      
      case "individual":
        return await this.adjustIndividualConfidence(matches, currentThreshold);
      
      case "stats":
        await this.showConfidenceStats(matches);
        return await this.adjustConfidenceInteractive(matches); // Return to menu
      
      default:
        return { newThreshold: currentThreshold, adjustedMatches: matches };
    }
  }

  /**
   * Adjust global confidence threshold
   */
  private static async adjustGlobalThreshold(matches: any[], currentThreshold: number): Promise<{newThreshold: number, adjustedMatches: any[]}> {
    console.log(chalk.cyan('\n🎯 GLOBAL THRESHOLD ADJUSTMENT'));
    console.log(chalk.gray('Lower threshold = more files included (but potentially more false positives)'));
    console.log(chalk.gray('Higher threshold = fewer files included (but higher accuracy)\n'));

    const thresholdAnswer = await inquirer.prompt([
      {
        type: "number",
        name: "threshold",
        message: "Enter new confidence threshold (0-100):",
        default: currentThreshold,
        validate: (value) => {
          if (typeof value !== 'number' || value < 0 || value > 100) {
            return "Threshold must be between 0 and 100";
          }
          return true;
        }
      }
    ]);

    const newThreshold = thresholdAnswer.threshold;
    
    // Show preview of new threshold
    const newHighCount = matches.filter(m => m.parsedFile.confidence >= newThreshold).length;
    const newLowCount = matches.filter(m => m.parsedFile.confidence < newThreshold).length;
    
    console.log(chalk.blue(`\n📊 Preview with ${newThreshold}% threshold:`));
    console.log(chalk.green(`   ✅ Will be organized: ${newHighCount} files`));
    console.log(chalk.yellow(`   ⚠️  Will need review: ${newLowCount} files`));

    const confirm = await this.confirmAction(`Apply threshold of ${newThreshold}%?`);
    
    if (confirm) {
      return { newThreshold, adjustedMatches: matches };
    } else {
      return await this.adjustGlobalThreshold(matches, currentThreshold);
    }
  }

  /**
   * Adjust individual file confidence scores
   */
  private static async adjustIndividualConfidence(matches: any[], currentThreshold: number): Promise<{newThreshold: number, adjustedMatches: any[]}> {
    console.log(chalk.cyan('\n📝 INDIVIDUAL FILE ADJUSTMENT'));
    console.log(chalk.gray('Review and manually adjust confidence for specific files\n'));

    // Sort by confidence (lowest first) to review problematic files first
    const sortedMatches = [...matches].sort((a, b) => a.parsedFile.confidence - b.parsedFile.confidence);
    const adjustedMatches = [...matches];
    
    // Show files below threshold for adjustment
    const lowConfidenceFiles = sortedMatches.filter(m => m.parsedFile.confidence < currentThreshold);
    
    if (lowConfidenceFiles.length === 0) {
      console.log(chalk.green('✅ All files meet the current confidence threshold!'));
      return { newThreshold: currentThreshold, adjustedMatches: matches };
    }

    console.log(chalk.yellow(`Found ${lowConfidenceFiles.length} files below ${currentThreshold}% threshold:\n`));

    for (const match of lowConfidenceFiles) {
      const file = match.parsedFile;
      
      // Display file info
      console.log(chalk.bold(`📁 ${file.fileName}`));
      console.log(chalk.gray(`   Detected anime: ${file.animeName}`));
      console.log(chalk.gray(`   Episode: ${file.episode || 'Unknown'}`));
      console.log(chalk.gray(`   Season: ${file.season || 'Unknown'}`));
      console.log(chalk.gray(`   Pattern: ${file.pattern || 'Generic'}`));
      console.log(chalk.gray(`   Current confidence: ${this.getConfidenceColor(file.confidence)}${file.confidence}%${chalk.gray('')}`));
      
      if (match.jikanData) {
        console.log(chalk.blue(`   ✅ API Match: ${match.jikanData.title} (${match.jikanData.year})`));
      } else {
        console.log(chalk.red(`   ❌ No API match found`));
      }

      const fileAction = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: "What would you like to do with this file?",
          choices: [
            { name: "🎯 Manually set confidence score", value: "adjust" },
            { name: "✅ Accept current confidence", value: "accept" },
            { name: "❌ Mark as non-anime (0% confidence)", value: "reject" },
            { name: "⏭️ Skip to next file", value: "skip" },
            { name: "🔚 Finish individual adjustments", value: "finish" }
          ]
        }
      ]);

      if (fileAction.action === "finish") {
        break;
      }

      if (fileAction.action === "adjust") {
        const newConfidence = await inquirer.prompt([
          {
            type: "number",
            name: "confidence",
            message: `Enter new confidence score (0-100) for "${file.fileName}":`,
            default: file.confidence,
            validate: (value) => {
              if (typeof value !== 'number' || value < 0 || value > 100) {
                return "Confidence must be between 0 and 100";
              }
              return true;
            }
          }
        ]);

        // Update confidence in adjusted matches
        const matchIndex = adjustedMatches.findIndex(m => m.parsedFile.fileName === file.fileName);
        if (matchIndex !== -1) {
          adjustedMatches[matchIndex].parsedFile.confidence = newConfidence.confidence;
          console.log(chalk.green(`   ✅ Updated confidence to ${newConfidence.confidence}%\n`));
        }
      } else if (fileAction.action === "reject") {
        // Set confidence to 0
        const matchIndex = adjustedMatches.findIndex(m => m.parsedFile.fileName === file.fileName);
        if (matchIndex !== -1) {
          adjustedMatches[matchIndex].parsedFile.confidence = 0;
          console.log(chalk.red(`   ❌ Marked as non-anime (0% confidence)\n`));
        }
      } else if (fileAction.action === "accept") {
        console.log(chalk.gray(`   ✅ Keeping current confidence (${file.confidence}%)\n`));
      }
    }

    return { newThreshold: currentThreshold, adjustedMatches };
  }

  /**
   * Show detailed confidence statistics
   */
  private static async showConfidenceStats(matches: any[]): Promise<void> {
    console.log(chalk.cyan('\n📊 CONFIDENCE DISTRIBUTION'));
    console.log(chalk.cyan('═'.repeat(40)));

    // Calculate statistics
    const confidenceScores = matches.map(m => m.parsedFile.confidence);
    const avgConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
    const minConfidence = Math.min(...confidenceScores);
    const maxConfidence = Math.max(...confidenceScores);

    console.log(chalk.blue('📈 Overall Statistics:'));
    console.log(`   Average confidence: ${Math.round(avgConfidence)}%`);
    console.log(`   Minimum confidence: ${minConfidence}%`);
    console.log(`   Maximum confidence: ${maxConfidence}%`);
    console.log(`   Total files: ${matches.length}\n`);

    // Show distribution by ranges
    const ranges = [
      { min: 90, max: 100, label: "Excellent (90-100%)", color: chalk.green },
      { min: 80, max: 89, label: "Good (80-89%)", color: chalk.cyan },
      { min: 70, max: 79, label: "Fair (70-79%)", color: chalk.yellow },
      { min: 50, max: 69, label: "Poor (50-69%)", color: chalk.red },
      { min: 0, max: 49, label: "Very Poor (0-49%)", color: chalk.magenta }
    ];

    console.log(chalk.blue('📊 Distribution by Range:'));
    for (const range of ranges) {
      const count = confidenceScores.filter(score => score >= range.min && score <= range.max).length;
      const percentage = Math.round((count / matches.length) * 100);
      const bar = '█'.repeat(Math.floor(percentage / 5));
      console.log(`   ${range.color(range.label)}: ${count} files (${percentage}%) ${bar}`);
    }

    console.log();
    await this.confirmAction("Press Enter to continue...");
  }

  /**
   * Get appropriate color for confidence score
   */
  private static getConfidenceColor(confidence: number): Function {
    if (confidence >= 90) return chalk.green;
    if (confidence >= 80) return chalk.cyan;
    if (confidence >= 70) return chalk.yellow;
    if (confidence >= 50) return chalk.red;
    return chalk.magenta;
  }
}
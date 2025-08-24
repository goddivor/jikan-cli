#!/usr/bin/env node

import { ArgsParser } from "./utils/args-parser";
import { AnimeCommands } from "./commands/anime-commands";
import { MangaCommands } from "./commands/manga-commands";
import { OrganizeCommands } from "./commands/organize-commands";
import { DisplayUtils } from "./utils/display";
import { AdvancedSearchOptions } from "./types/anime";
import { OrganizeOptions } from "./types/organize";

const args = process.argv.slice(2);
const parsedArgs = ArgsParser.parse(args);

async function main(): Promise<void> {
  // Handle help command
  if (args.includes('--help') || args.includes('-h')) {
    ArgsParser.showHelp();
    return;
  }

  // Handle organize help command
  if (parsedArgs.showOrganizeHelp) {
    await OrganizeCommands.showOrganizeHelp();
    return;
  }

  // Handle organize command
  if (parsedArgs.organize) {
    const organizeOptions: OrganizeOptions = {
      sourceDirectory: parsedArgs.organize,
      targetDirectory: parsedArgs.organizeTarget,
      preview: parsedArgs.organizePreview,
      interactive: parsedArgs.interactive || parsedArgs.organizeAdjustConfidence, // Auto-enable interactive if confidence adjustment is requested
      minConfidence: parsedArgs.organizeMinConfidence,
      adjustConfidence: parsedArgs.organizeAdjustConfidence,
      handleDuplicates: parsedArgs.organizeHandleDuplicates,
      createSeasonFolders: true,
    };
    
    await OrganizeCommands.organizeAnimeFiles(organizeOptions);
    return;
  }

  // Handle genres list command
  if (parsedArgs.showGenres) {
    if (parsedArgs.mediaType === "manga") {
      MangaCommands.showAllGenres();
    } else {
      AnimeCommands.showAllGenres();
    }
    return;
  }

  // Build advanced search options
  const advancedOptions: AdvancedSearchOptions = {
    genres: parsedArgs.genres,
    excludeGenres: parsedArgs.excludeGenres,
    year: parsedArgs.year,
    yearRange: parsedArgs.yearRange,
    minScore: parsedArgs.minScore,
    maxScore: parsedArgs.maxScore,
    fuzzySearch: parsedArgs.fuzzySearch,
    fuzzyThreshold: parsedArgs.fuzzyThreshold,
  };

  // Main command routing
  if (parsedArgs.animeId) {
    await AnimeCommands.getAnimeDetails(parsedArgs.animeId);
  } else if (parsedArgs.mangaId) {
    await MangaCommands.getMangaDetails(parsedArgs.mangaId);
  } else if (parsedArgs.showTop) {
    if (parsedArgs.mediaType === "manga") {
      await MangaCommands.showTopMangas(parsedArgs.topLimit, parsedArgs.orderBy, parsedArgs.sortOrder, parsedArgs.interactive);
    } else {
      await AnimeCommands.showTopAnimes(parsedArgs.topLimit, parsedArgs.orderBy, parsedArgs.sortOrder, parsedArgs.interactive);
    }
  } else if (parsedArgs.showSeason) {
    if (parsedArgs.mediaType === "manga") {
      DisplayUtils.displayError("Seasonal search is only available for anime");
      process.exit(1);
    }
    if (!parsedArgs.seasonYear || !parsedArgs.seasonName) {
      DisplayUtils.displayError("Year and season required for --season");
      DisplayUtils.displayUsage();
      process.exit(1);
    }
    await AnimeCommands.showSeasonAnimes(parsedArgs.seasonYear, parsedArgs.seasonName, parsedArgs.orderBy, parsedArgs.sortOrder, parsedArgs.interactive);
  } else if (parsedArgs.showRandom) {
    if (parsedArgs.mediaType === "manga") {
      await MangaCommands.showRandomManga();
    } else {
      await AnimeCommands.showRandomAnime();
    }
  } else if (parsedArgs.genreSearch && parsedArgs.genres) {
    // Genre-only search
    if (parsedArgs.mediaType === "manga") {
      await MangaCommands.searchMangaByGenres(
        parsedArgs.genres,
        parsedArgs.limit,
        parsedArgs.detailsFlag,
        parsedArgs.excludeGenres,
        parsedArgs.orderBy,
        parsedArgs.sortOrder,
        parsedArgs.interactive,
        advancedOptions
      );
    } else {
      await AnimeCommands.searchAnimeByGenres(
        parsedArgs.genres,
        parsedArgs.limit,
        parsedArgs.detailsFlag,
        parsedArgs.excludeGenres,
        parsedArgs.orderBy,
        parsedArgs.sortOrder,
        parsedArgs.interactive,
        advancedOptions
      );
    }
  } else if (parsedArgs.query) {
    // Regular search with advanced options
    if (parsedArgs.mediaType === "manga") {
      await MangaCommands.searchManga(
        parsedArgs.query,
        parsedArgs.limit,
        parsedArgs.detailsFlag,
        parsedArgs.type,
        parsedArgs.status,
        parsedArgs.orderBy,
        parsedArgs.sortOrder,
        parsedArgs.interactive,
        advancedOptions
      );
    } else {
      await AnimeCommands.searchAnime(
        parsedArgs.query,
        parsedArgs.limit,
        parsedArgs.detailsFlag,
        parsedArgs.type,
        parsedArgs.status,
        parsedArgs.orderBy,
        parsedArgs.sortOrder,
        parsedArgs.interactive,
        advancedOptions
      );
    }
  } else {
    DisplayUtils.displayUsage();
    process.exit(1);
  }
}

main().catch((error) => {
  DisplayUtils.displayError("Unexpected error:", error);
  process.exit(1);
});
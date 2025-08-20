#!/usr/bin/env node

import { ArgsParser } from "./utils/args-parser";
import { AnimeCommands } from "./commands/anime-commands";
import { DisplayUtils } from "./utils/display";

const args = process.argv.slice(2);
const parsedArgs = ArgsParser.parse(args);

async function main(): Promise<void> {
  if (parsedArgs.animeId) {
    await AnimeCommands.getAnimeDetails(parsedArgs.animeId);
  } else if (parsedArgs.showTop) {
    await AnimeCommands.showTopAnimes(parsedArgs.topLimit, parsedArgs.orderBy, parsedArgs.sortOrder);
  } else if (parsedArgs.showSeason) {
    if (!parsedArgs.seasonYear || !parsedArgs.seasonName) {
      DisplayUtils.displayError("Année et saison requises pour --season");
      DisplayUtils.displayUsage();
      process.exit(1);
    }
    await AnimeCommands.showSeasonAnimes(parsedArgs.seasonYear, parsedArgs.seasonName, parsedArgs.orderBy, parsedArgs.sortOrder);
  } else if (parsedArgs.showRandom) {
    await AnimeCommands.showRandomAnime();
  } else if (parsedArgs.query) {
    await AnimeCommands.searchAnime(
      parsedArgs.query,
      parsedArgs.limit,
      parsedArgs.detailsFlag,
      parsedArgs.type,
      parsedArgs.status,
      parsedArgs.orderBy,
      parsedArgs.sortOrder
    );
  } else {
    DisplayUtils.displayUsage();
    process.exit(1);
  }
}

main().catch((error) => {
  DisplayUtils.displayError("Erreur inattendue :", error);
  process.exit(1);
});
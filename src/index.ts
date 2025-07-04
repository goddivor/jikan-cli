#!/usr/bin/env node

import { ArgsParser } from "./utils/args-parser.js";
import { AnimeCommands } from "./commands/anime-commands.js";
import { DisplayUtils } from "./utils/display.js";

const args = process.argv.slice(2);
const parsedArgs = ArgsParser.parse(args);

async function main(): Promise<void> {
  if (parsedArgs.animeId) {
    await AnimeCommands.getAnimeDetails(parsedArgs.animeId);
  } else if (parsedArgs.showTop) {
    await AnimeCommands.showTopAnimes(parsedArgs.topLimit);
  } else if (parsedArgs.query) {
    await AnimeCommands.searchAnime(
      parsedArgs.query,
      parsedArgs.limit,
      parsedArgs.detailsFlag
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

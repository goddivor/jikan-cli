export interface ParsedArgs {
  query?: string;
  limit: number;
  animeId?: string;
  mangaId?: string;
  topLimit: number;
  detailsFlag: boolean;
  showTop: boolean;
  showSeason: boolean;
  seasonYear?: string;
  seasonName?: string;
  showRandom: boolean;
  type?: string;
  status?: string;
  orderBy?: string;
  sortOrder?: string;
  interactive: boolean;
  mediaType: "anime" | "manga";
  // Advanced search options
  genres?: string[];
  excludeGenres?: string[];
  year?: number;
  yearRange?: { start: number; end: number };
  minScore?: number;
  maxScore?: number;
  fuzzySearch?: boolean;
  fuzzyThreshold?: number;
  genreSearch?: boolean;
  showGenres?: boolean;
  // Organization options
  organize?: string;
  organizePreview?: boolean;
  organizeTarget?: string;
  organizeMinConfidence?: number;
  organizeHandleDuplicates?: 'skip' | 'rename' | 'overwrite';
  showOrganizeHelp?: boolean;
}

export class ArgsParser {
  static parse(args: string[]): ParsedArgs {
    const searchIndex = args.findIndex(
      (arg) => arg === "-s" || arg === "--search"
    );
    const limitIndex = args.findIndex(
      (arg) => arg === "-l" || arg === "--limit"
    );
    const idIndex = args.findIndex((arg) => arg === "-i" || arg === "--id");
    const mangaIdIndex = args.findIndex((arg) => arg === "-mi" || arg === "--manga-id");
    const topIndex = args.findIndex((arg) => arg === "-t" || arg === "--top");
    const seasonIndex = args.findIndex(
      (arg) => arg === "-ss" || arg === "--season"
    );
    const randomIndex = args.findIndex(
      (arg) => arg === "-r" || arg === "--random"
    );

    // Basic filtering
    const typeIndex = args.findIndex((arg) => arg === "--type");
    const statusIndex = args.findIndex((arg) => arg === "--status");
    const orderByIndex = args.findIndex((arg) => arg === "--sort" || arg === "--order-by");
    const sortOrderIndex = args.findIndex((arg) => arg === "--order" || arg === "--sort-order");

    // Advanced search options
    const genresIndex = args.findIndex((arg) => arg === "--genres" || arg === "-g");
    const excludeGenresIndex = args.findIndex((arg) => arg === "--exclude-genres" || arg === "--no-genres");
    const yearIndex = args.findIndex((arg) => arg === "--year" || arg === "-y");
    const yearRangeIndex = args.findIndex((arg) => arg === "--year-range");
    const minScoreIndex = args.findIndex((arg) => arg === "--min-score");
    const maxScoreIndex = args.findIndex((arg) => arg === "--max-score");
    const fuzzyThresholdIndex = args.findIndex((arg) => arg === "--fuzzy-threshold");
    const genreSearchIndex = args.findIndex((arg) => arg === "--genre-search" || arg === "-gs");
    const mediaTypeIndex = args.findIndex((arg) => arg === "--media" || arg === "-m");

    // Organization options
    const organizeIndex = args.findIndex((arg) => arg === "--organize");
    const organizeTargetIndex = args.findIndex((arg) => arg === "--target");
    const organizeMinConfidenceIndex = args.findIndex((arg) => arg === "--min-confidence");
    const organizeHandleDuplicatesIndex = args.findIndex((arg) => arg === "--handle-duplicates");

    // Flags
    const detailsFlag = args.includes("-d") || args.includes("--details");
    const interactive = args.includes("--interactive");
    const fuzzySearch = args.includes("--fuzzy") || args.includes("-f");
    const showGenres = args.includes("--list-genres") || args.includes("--genres-list");
    const organizePreview = args.includes("--preview");
    const showOrganizeHelp = args.includes("--organize-help");

    // Basic parsing
    const query = searchIndex !== -1 ? args[searchIndex + 1] : undefined;
    const limit =
      limitIndex !== -1 && args[limitIndex + 1]
        ? parseInt(args[limitIndex + 1])
        : 5;
    const animeId = idIndex !== -1 ? args[idIndex + 1] : undefined;
    const mangaId = mangaIdIndex !== -1 ? args[mangaIdIndex + 1] : undefined;
    const mediaType = mediaTypeIndex !== -1 && args[mediaTypeIndex + 1] === "manga" ? "manga" : "anime";
    const topLimit =
      topIndex !== -1 &&
      args[topIndex + 1] &&
      !args[topIndex + 1].startsWith("-")
        ? parseInt(args[topIndex + 1])
        : 10;
    const showTop = topIndex !== -1;
    const showSeason = seasonIndex !== -1;
    const seasonYear = seasonIndex !== -1 ? args[seasonIndex + 1] : undefined;
    const seasonName = seasonIndex !== -1 ? args[seasonIndex + 2] : undefined;
    const type = typeIndex !== -1 ? args[typeIndex + 1] : undefined;
    const status = statusIndex !== -1 ? args[statusIndex + 1] : undefined;
    const orderBy = orderByIndex !== -1 ? args[orderByIndex + 1] : undefined;
    const sortOrder = sortOrderIndex !== -1 ? args[sortOrderIndex + 1] : "desc";
    const showRandom = randomIndex !== -1;
    const genreSearch = genreSearchIndex !== -1;

    // Advanced parsing
    const genres = genresIndex !== -1 && args[genresIndex + 1] 
      ? args[genresIndex + 1].split(',').map(g => g.trim())
      : genreSearchIndex !== -1 && args[genreSearchIndex + 1]
      ? args[genreSearchIndex + 1].split(',').map(g => g.trim())
      : undefined;

    const excludeGenres = excludeGenresIndex !== -1 && args[excludeGenresIndex + 1]
      ? args[excludeGenresIndex + 1].split(',').map(g => g.trim())
      : undefined;

    const year = yearIndex !== -1 && args[yearIndex + 1]
      ? parseInt(args[yearIndex + 1])
      : undefined;

    let yearRange: { start: number; end: number } | undefined;
    if (yearRangeIndex !== -1 && args[yearRangeIndex + 1]) {
      const range = args[yearRangeIndex + 1].split('-');
      if (range.length === 2) {
        const start = parseInt(range[0]);
        const end = parseInt(range[1]);
        if (!isNaN(start) && !isNaN(end)) {
          yearRange = { start, end };
        }
      }
    }

    const minScore = minScoreIndex !== -1 && args[minScoreIndex + 1]
      ? parseFloat(args[minScoreIndex + 1])
      : undefined;

    const maxScore = maxScoreIndex !== -1 && args[maxScoreIndex + 1]
      ? parseFloat(args[maxScoreIndex + 1])
      : undefined;

    const fuzzyThreshold = fuzzyThresholdIndex !== -1 && args[fuzzyThresholdIndex + 1]
      ? parseFloat(args[fuzzyThresholdIndex + 1])
      : 0.4;

    // Organization parsing
    const organize = organizeIndex !== -1 ? args[organizeIndex + 1] : undefined;
    const organizeTarget = organizeTargetIndex !== -1 ? args[organizeTargetIndex + 1] : undefined;
    const organizeMinConfidence = organizeMinConfidenceIndex !== -1 && args[organizeMinConfidenceIndex + 1]
      ? parseInt(args[organizeMinConfidenceIndex + 1])
      : 70;
    const organizeHandleDuplicates = organizeHandleDuplicatesIndex !== -1 && args[organizeHandleDuplicatesIndex + 1]
      ? args[organizeHandleDuplicatesIndex + 1] as 'skip' | 'rename' | 'overwrite'
      : 'skip';

    return {
      query,
      limit,
      animeId,
      mangaId,
      topLimit,
      detailsFlag,
      showTop,
      showSeason,
      seasonYear,
      seasonName,
      showRandom,
      type,
      status,
      orderBy,
      sortOrder,
      interactive,
      mediaType,
      genres,
      excludeGenres,
      year,
      yearRange,
      minScore,
      maxScore,
      fuzzySearch,
      fuzzyThreshold,
      genreSearch,
      showGenres,
      organize,
      organizePreview,
      organizeTarget,
      organizeMinConfidence,
      organizeHandleDuplicates,
      showOrganizeHelp,
    };
  }

  static showHelp(): void {
    const helpText = `
🎌 Jikan CLI - Advanced Anime & Manga Search Tool

USAGE:
  jikan-cli [COMMAND] [OPTIONS]

MEDIA TYPE:
  -m, --media <type>            Specify media type: anime (default) or manga

BASIC COMMANDS:
  -s, --search <query>          Search by name
  -t, --top [limit]             Show top entries (default: 10)
  -ss, --season <year> <season> Show seasonal anime (anime only)
  -r, --random                  Show random entry
  -i, --id <id>                 Show anime details by ID
  -mi, --manga-id <id>          Show manga details by ID
  --list-genres                 Show all available genres

BASIC OPTIONS:
  -l, --limit <number>          Number of results (default: 5)
  -d, --details                 Show detailed information
  --interactive                 Interactive mode with selection menu

FILTERS:
  --type <type>                 Filter by type
                                Anime: tv, movie, ova, special, ona, music
                                Manga: manga, novel, lightnovel, oneshot, doujin, manhwa, manhua
  --status <status>             Filter by status (airing/publishing, completed, upcoming)
  --sort <criteria>             Sort by (score, members, start_date, title, rank, popularity)
                                Manga also supports: chapters, volumes
  --order <order>               Sort order (asc, desc - default: desc)

ADVANCED SEARCH:
  -g, --genres <genres>         Include genres (comma-separated)
  --exclude-genres <genres>     Exclude genres (comma-separated)
  -gs, --genre-search <genres>  Search by genres only
  -y, --year <year>             Filter by specific year
  --year-range <start-end>      Filter by year range (e.g., 2010-2020)
  --min-score <score>           Minimum score filter (0.0-10.0)
  --max-score <score>           Maximum score filter (0.0-10.0)
  -f, --fuzzy                   Enable fuzzy search (typo tolerance)
  --fuzzy-threshold <number>    Fuzzy search threshold (0.0-1.0, default: 0.4)

ORGANIZATION:
  --organize <directory>        Organize anime files in specified directory
  --preview                     Show preview without moving files
  --target <directory>          Target directory for organized files
  --min-confidence <0-100>      Minimum confidence threshold (default: 70)
  --handle-duplicates <mode>    skip|rename|overwrite (default: skip)
  --organize-help               Show detailed organization help

EXAMPLES:
  Basic anime search:
    jikan-cli -s "naruto"
    jikan-cli -s "attack on titan" -l 3 --details

  Basic manga search:
    jikan-cli --media manga -s "one piece"
    jikan-cli --media manga -t 10 --interactive

  Advanced filtering:
    jikan-cli -s "dragon" --genres "action,fantasy" --min-score 8.0
    jikan-cli --media manga --genre-search "romance,comedy" --year-range 2020-2023
    jikan-cli -s "narto" --fuzzy --fuzzy-threshold 0.6

  Interactive mode:
    jikan-cli -s "naruto" --interactive
    jikan-cli --media manga --genre-search "action" --interactive

  File organization:
    jikan-cli --organize "./Downloads" --preview
    jikan-cli --organize "./Downloads" --interactive
    jikan-cli --organize "./Downloads" --target "./Anime Library"
`;
    console.log(helpText);
  }
}

export interface ParsedArgs {
  query?: string;
  limit: number;
  animeId?: string;
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

    // Flags
    const detailsFlag = args.includes("-d") || args.includes("--details");
    const interactive = args.includes("--interactive");
    const fuzzySearch = args.includes("--fuzzy") || args.includes("-f");
    const showGenres = args.includes("--list-genres") || args.includes("--genres-list");

    // Basic parsing
    const query = searchIndex !== -1 ? args[searchIndex + 1] : undefined;
    const limit =
      limitIndex !== -1 && args[limitIndex + 1]
        ? parseInt(args[limitIndex + 1])
        : 5;
    const animeId = idIndex !== -1 ? args[idIndex + 1] : undefined;
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

    return {
      query,
      limit,
      animeId,
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
    };
  }

  static showHelp(): void {
    const helpText = `
🎌 Jikan CLI - Advanced Anime Search Tool

USAGE:
  jikan-cli [COMMAND] [OPTIONS]

BASIC COMMANDS:
  -s, --search <query>          Search anime by name
  -t, --top [limit]             Show top anime (default: 10)
  -ss, --season <year> <season> Show seasonal anime
  -r, --random                  Show random anime
  -i, --id <id>                 Show anime details by ID
  --list-genres                 Show all available genres

BASIC OPTIONS:
  -l, --limit <number>          Number of results (default: 5)
  -d, --details                 Show detailed information
  --interactive                 Interactive mode with selection menu

FILTERS:
  --type <type>                 Filter by type (tv, movie, ova, special, ona, music)
  --status <status>             Filter by status (airing, completed, upcoming)
  --sort <criteria>             Sort by (score, members, start_date, title, rank, popularity)
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

EXAMPLES:
  Basic search:
    jikan-cli -s "naruto"
    jikan-cli -s "attack on titan" -l 3 --details

  Advanced filtering:
    jikan-cli -s "dragon" --genres "action,fantasy" --min-score 8.0
    jikan-cli --genre-search "romance,comedy" --year-range 2020-2023
    jikan-cli -s "narto" --fuzzy --fuzzy-threshold 0.6
    jikan-cli -t 10 --exclude-genres "ecchi,harem" --type tv

  Interactive mode:
    jikan-cli -s "naruto" --interactive
    jikan-cli --genre-search "action" --interactive
`;
    console.log(helpText);
  }
}

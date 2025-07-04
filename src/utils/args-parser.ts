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

    const typeIndex = args.findIndex((arg) => arg === "--type");
    const statusIndex = args.findIndex((arg) => arg === "--status");

    const detailsFlag = args.includes("-d") || args.includes("--details");

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
    const showRandom = randomIndex !== -1;

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
    };
  }
}

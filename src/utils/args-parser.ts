export interface ParsedArgs {
  query?: string;
  limit: number;
  animeId?: string;
  topLimit: number;
  detailsFlag: boolean;
  showTop: boolean;
}

export class ArgsParser {
  static parse(args: string[]): ParsedArgs {
    const searchIndex = args.findIndex((arg) => arg === "-s" || arg === "--search");
    const limitIndex = args.findIndex((arg) => arg === "-l" || arg === "--limit");
    const idIndex = args.findIndex((arg) => arg === "-i" || arg === "--id");
    const topIndex = args.findIndex((arg) => arg === "-t" || arg === "--top");
    const detailsFlag = args.includes("-d") || args.includes("--details");

    const query = searchIndex !== -1 ? args[searchIndex + 1] : undefined;
    const limit = limitIndex !== -1 && args[limitIndex + 1]
      ? parseInt(args[limitIndex + 1])
      : 5;
    const animeId = idIndex !== -1 ? args[idIndex + 1] : undefined;
    const topLimit = topIndex !== -1 && args[topIndex + 1] && !args[topIndex + 1].startsWith("-")
      ? parseInt(args[topIndex + 1])
      : 10;
    const showTop = topIndex !== -1;

    return {
      query,
      limit,
      animeId,
      topLimit,
      detailsFlag,
      showTop
    };
  }
}

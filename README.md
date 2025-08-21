# 📺 jikan-cli

> A fast and simple CLI application to search for anime using the [Jikan API](https://jikan.moe), written in TypeScript.

---

## 🚀 Features

### Basic Search & Discovery
- **Anime Search** by name (`-s` or `--search`)
- **Top Anime** listing (`-t` or `--top`)
- **Seasonal Anime** (`-ss` or `--season`)
- **Random Anime** (`-r` or `--random`)
- **Anime Details** by ID (`-i` or `--id`)

### 🎮 Interactive Mode
- Select anime from a navigable list (`--interactive`)
- View details without typing IDs
- Navigate with arrow keys
- User-friendly menu system

### 🔍 Advanced Search Features
- **Genre-Specific Search** (`-g`, `--genres`, `--genre-search`)
  - Search by multiple genres (comma-separated)
  - Comprehensive genre database with 25+ categories
- **Genre Exclusion** (`--exclude-genres`)
  - Filter out unwanted genres from results
- **Combined Filters**:
  - Year filtering (`-y`, `--year`) or range (`--year-range`)
  - Score filtering (`--min-score`, `--max-score`)
  - Type and status filtering
- **Fuzzy Search** (`-f`, `--fuzzy`)
  - Typo tolerance with configurable threshold
  - Finds results even with misspelled queries
- **Custom Sorting** (`--sort`, `--order`)
  - Sort by: Score, Members, Start Date, Title, Rank, Popularity
  - Ascending or Descending order

### 📊 Display & Output
- **Rich Display**:
  - Title and year
  - Score and episode count
  - MyAnimeList link
  - Image URL
  - Genre information
  - Synopsis (with `--details` flag)
- **Colorized Output** with [chalk](https://www.npmjs.com/package/chalk)
- **Comprehensive Help** system (`--help`)
- **Genre Discovery** (`--list-genres`)

---

## 📦 Installation

### 1. Clone and install dependencies

```bash
git clone https://github.com/goddivor/jikan-cli.git
cd jikan-cli
npm install
```

### 2. Build the project

```bash
npm run build
```

### 3. Install globally (optional)

```bash
npm install -g .
```

---

## 🧪 Usage

### Basic Commands

#### Search by Name
```bash
jikan-cli -s "naruto"
jikan-cli -s "attack on titan" -l 3 --details
```

#### List Available Genres
```bash
jikan-cli --list-genres
```

#### Get Help
```bash
jikan-cli --help
```

### 🔍 Advanced Search Examples

#### Genre-Specific Search
```bash
# Search by single genre
jikan-cli --genre-search "action" -l 5

# Search by multiple genres
jikan-cli --genre-search "action,fantasy" --min-score 8.0

# Include specific genres in regular search
jikan-cli -s "sword" --genres "fantasy,adventure"
```

#### Exclude Genres
```bash
# Exclude unwanted content
jikan-cli -s "school" --exclude-genres "ecchi,harem"

# Genre search with exclusions
jikan-cli --genre-search "romance" --exclude-genres "drama" --min-score 7.5
```

#### Year and Score Filtering
```bash
# Filter by specific year
jikan-cli --genre-search "sci-fi" --year 2023

# Filter by year range
jikan-cli -s "mecha" --year-range 2010-2020 --min-score 8.0

# Score range filtering
jikan-cli -t 20 --min-score 8.5 --max-score 9.5
```

#### Fuzzy Search (Typo Tolerance)
```bash
# Automatic typo correction
jikan-cli -s "narto" --fuzzy

# Custom fuzzy threshold (0.0-1.0, lower = more strict)
jikan-cli -s "atack on titen" --fuzzy --fuzzy-threshold 0.6
```

#### Combined Advanced Filtering
```bash
# Complex search with multiple filters
jikan-cli -s "dragon" \
  --genres "action,fantasy" \
  --exclude-genres "ecchi" \
  --min-score 8.0 \
  --year-range 2015-2023 \
  --type tv \
  --sort score \
  --order desc

# Genre search with all filters
jikan-cli --genre-search "romance,comedy" \
  --exclude-genres "harem" \
  --min-score 7.0 \
  --year-range 2020-2024 \
  --interactive
```

### 🎮 Interactive Mode

```bash
# Interactive search - select anime from a list
jikan-cli -s "naruto" --interactive

# Interactive genre search
jikan-cli --genre-search "action,thriller" --interactive

# Interactive top anime with navigation
jikan-cli -t 10 --interactive

# Interactive seasonal anime
jikan-cli -ss 2023 fall --interactive
```

### Traditional Commands

#### Top Anime
```bash
jikan-cli -t 10 --sort members --order desc
jikan-cli -t 20 --exclude-genres "ecchi,harem" --min-score 8.0
```

#### Seasonal Anime
```bash
jikan-cli -ss 2023 fall --sort score --order desc
jikan-cli -ss 2024 spring --genres "romance" --interactive
```

#### Random Anime
```bash
jikan-cli -r
```

#### Anime Details by ID
```bash
jikan-cli -i 1735
```

---

## 📋 Command Reference

### Main Commands
- `-s`, `--search <query>` : Search anime by name
- `-t`, `--top [limit]` : Show top anime (default: 10)
- `-ss`, `--season <year> <season>` : Show anime from specific season
- `-r`, `--random` : Show random anime
- `-i`, `--id <id>` : Show anime details by ID
- `-gs`, `--genre-search <genres>` : Search by genres only
- `--list-genres` : Show all available genres
- `--help`, `-h` : Show detailed help information

### Basic Options
- `-l`, `--limit <number>` : Number of results to display (default: 5)
- `-d`, `--details` : Show detailed information including synopsis
- `--interactive` : Enable interactive mode with selectable anime list

### Basic Filters
- `--type <type>` : Filter by type (tv, movie, ova, special, ona, music)
- `--status <status>` : Filter by status (airing, completed, upcoming)

### Advanced Search Options
- `-g`, `--genres <genres>` : Include specific genres (comma-separated)
- `--exclude-genres <genres>` : Exclude specific genres (comma-separated)
- `-y`, `--year <year>` : Filter by specific year
- `--year-range <start-end>` : Filter by year range (e.g., 2010-2020)
- `--min-score <score>` : Minimum score filter (0.0-10.0)
- `--max-score <score>` : Maximum score filter (0.0-10.0)
- `-f`, `--fuzzy` : Enable fuzzy search (typo tolerance)
- `--fuzzy-threshold <number>` : Fuzzy search threshold (0.0-1.0, default: 0.4)

### Sorting Options
- `--sort <criteria>` : Sort by (score, members, start_date, title, rank, popularity)
- `--order <order>` : Sort order (asc, desc - default: desc)

---

## 📸 Example Output

### Interactive Mode
```
🎮 Interactive Mode Enabled

Search: "naruto" | Found: 3 results
Use ↑↓ arrows to navigate, Enter to select

? 📋 Select an anime to view details: (Use arrow keys)
❯ 1. Naruto (2002) - ⭐ 8.01 📺 220ep
  2. Road of Naruto (Unknown year) - ⭐ 8.39 📺 1ep
  3. Naruto Soyokazeden Movie (Unknown year) - ⭐ 6.95 📺 1ep
  ───────────────────────────
  🔙 Go back
  ❌ Exit
```

### Standard Mode
```
🔍 Search results for "jujutsu kaisen" (3 max) - Filters: sort=score, order=desc:

1. Jujutsu Kaisen (2020)
   Score: 8.54 | Episodes: 24
   https://myanimelist.net/anime/40748/Jujutsu_Kaisen
   🖼️ Image: https://cdn.myanimelist.net/images/anime/1171/109222.jpg
---
2. Jujutsu Kaisen 2nd Season (2023)
   Score: 8.85 | Episodes: 23
   https://myanimelist.net/anime/51009/Jujutsu_Kaisen_2nd_Season
   🖼️ Image: https://cdn.myanimelist.net/images/anime/1792/138022.jpg
---
...
```

---

## 🏗️ Project Structure

```
jikan-cli/
├── src/
│   ├── commands/          # Command implementations
│   │   └── anime-commands.ts
│   ├── services/          # API service layer
│   │   └── jikan-api.ts
│   ├── types/             # TypeScript type definitions
│   │   └── anime.ts
│   ├── utils/             # Utility functions
│   │   ├── args-parser.ts
│   │   ├── display.ts
│   │   └── interactive.ts # Interactive mode utilities
│   └── index.ts           # Main CLI entry point
├── dist/                  # Compiled JavaScript files
├── package.json           # Dependencies & CLI metadata
├── tsconfig.json          # TypeScript configuration
└── LICENSE               # MIT License
```

---

## 🛠️ Technologies Used

- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Jikan API](https://jikan.moe) - Unofficial MyAnimeList API
- [chalk](https://www.npmjs.com/package/chalk) - Terminal styling
- [inquirer](https://www.npmjs.com/package/inquirer) - Interactive CLI prompts
- [Fuse.js](https://fusejs.io/) - Fuzzy search library for typo tolerance

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📃 License

MIT © 2025 - [View License](./LICENSE)

---

## 🔗 Links

- [Jikan API Documentation](https://docs.api.jikan.moe/)
- [MyAnimeList](https://myanimelist.net/)
- [Report Issues](https://github.com/goddivor/jikan-cli/issues)
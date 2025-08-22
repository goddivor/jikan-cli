# 🎌 jikan-cli

> A fast and simple CLI application to search for **anime & manga** using the [Jikan API](https://jikan.moe), written in TypeScript.

---

## 🚀 Features

### 🗂️ **NEW: Auto-Organization**
- **Intelligent anime file organization** from messy download folders
- **Pattern recognition** for multiple streaming platform formats  
- **API validation** via Jikan (MyAnimeList) for accurate anime names
- **Smart filtering** excludes non-anime files (music, tutorials, clips)
- **Preview mode** to review changes before organizing
- **Interactive mode** with confidence scoring and manual review
- **Duplicate handling** with skip, rename, or overwrite options
- **Custom target directories** and confidence thresholds

### Media Type Support
- **Anime & Manga** support with `--media` flag (anime by default)
- Seamless switching between anime and manga search

### Basic Search & Discovery
- **Search by name** (`-s` or `--search`) - works for both anime and manga
- **Top entries** listing (`-t` or `--top`) - anime or manga based on media type  
- **Seasonal Anime** (`-ss` or `--season`) - anime only
- **Random entry** (`-r` or `--random`) - anime or manga based on media type
- **Details by ID** (`-i` for anime, `-mi` for manga)

### 🎮 Interactive Mode
- Select anime/manga from a navigable list (`--interactive`)
- View details without typing IDs
- Navigate with arrow keys
- User-friendly menu system
- Supports both anime and manga

### 🔍 Advanced Search Features
- **Genre-Specific Search** (`-g`, `--genres`, `--genre-search`)
  - Search by multiple genres (comma-separated)
  - Comprehensive genre database with 25+ categories
  - Works for both anime and manga
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
  - **Anime**: Score, Members, Start Date, Title, Rank, Popularity
  - **Manga**: Score, Members, Start Date, Title, Rank, Popularity, Chapters, Volumes
  - Ascending or Descending order

### 🗂️ File Organization
- **Auto-organize anime collections** from download folders
- **Multi-platform format support**:
  - Voiranime: `"Anime (VF) - Anime - 01 VF - 01 - Voiranime.mp4"`
  - Abbreviated: `"SNK_S1_1_VF.mp4"`
  - Simple: `"Naruto.mp4"`
- **Smart file classification** with confidence scoring
- **Season-based folder structure** creation
- **Conflict resolution** for duplicate files
- **Preview mode** for safe testing

### 📊 Display & Output
- **Rich Display**:
  - Title and year
  - **Anime**: Score and episode count
  - **Manga**: Score, chapter count, and volume count
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

## 🗂️ **Auto-Organization Feature**

### Quick Start

```bash
# Preview what would be organized (recommended first step)
jikan-cli --organize "./Downloads" --preview

# Interactive organization with manual review
jikan-cli --organize "./Downloads" --interactive

# Direct organization to specific folder
jikan-cli --organize "./Downloads" --target "./Anime Library"
```

### How It Works

1. **🔍 File Scanning**: Detects video files in your specified directory
2. **🎯 Smart Classification**: Separates anime from non-anime files (music, tutorials, etc.)
3. **📝 Pattern Recognition**: Parses anime names, seasons, and episodes from various formats
4. **🌐 API Validation**: Validates and normalizes anime names using Jikan API
5. **📁 Structure Creation**: Generates organized folder structure
6. **📦 File Organization**: Moves files to appropriate locations

### Supported File Patterns

**🇫🇷 French Platforms:**

*Voiranime:*
```
Kamitsubaki City Under Construction - Kamitsubaki City Under Construction - 03 VOSTFR - 03 - Voiranime.mp4
→ Kamitsubaki City Under Construction/Season 1/Kamitsubaki City Under Construction - S01E03 [VOSTFR].mp4
```

*Anime-Sama:*
```
A Couple of Cuckoos - Saison 2 - Anime-Sama - Streaming et catalogage d'animes et scans..ts
→ A Couple of Cuckoos/Season 2/A Couple of Cuckoos - S02E01.ts
```

*ADKami:*
```
Kimi to Idol Precure♪ - Episode 28 vostfr - ADKami.mp4
→ Kimi to Idol Precure♪/Season 1/Kimi to Idol Precure♪ - S01E28 [VOSTFR].mp4
```

*FRAnime:*
```
Mushishi Special - Hihamukage S1 EP1 VOSTFR - FRAnime.fr #1 DE L'ANIME SANS PUB ET GRATUIT.mp4
→ Mushishi Special - Hihamukage/Season 1/Mushishi Special - Hihamukage - S01E01 [VOSTFR].mp4
```

**🌍 International Platforms:**

*HiAnime:*
```
Watch Kamitsubaki City Under Construction English Sub-Dub online Free on HiAnime.to.ts
→ Kamitsubaki City Under Construction/Season 1/Kamitsubaki City Under Construction - S01E01.ts
```

*Nyaa Torrents:*
```
[shincaps] Black Clover - 129 (ANIMAX Asia 1920x1080 H264 MP2).ts
→ Black Clover/Season 1/Black Clover - S01E129.ts

[Tsundere-Raws] Black Clover - 169 VOSTFR [CR 720p].mkv
→ Black Clover/Season 1/Black Clover - S01E169 [VOSTFR].mkv

Black.Clover.S01.MULTi.1080p.BDRiP.x265-KAF
→ Black Clover/Season 1/ (season pack)
```

**📱 Simplified Formats:**
```
NarutoE01.mp4 → Naruto/Season 1/Naruto - S01E01.mp4
Shingeki no Kyojin 3E17 [VF].mp4 → Shingeki no Kyojin/Season 3/Shingeki no Kyojin - S03E17 [VF].mp4
I Left My AE09.mp4 → I Left My A/Season 1/I Left My A - S01E09.mp4
```

### Generated Structure

```
Anime Library/
├── Naruto/
│   ├── Season 1/
│   │   ├── Naruto - S01E01 [VF].mp4
│   │   ├── Naruto - S01E02 [VF].mp4
│   │   └── ...
│   └── Season 2/
├── Attack on Titan/
│   ├── Season 1/
│   ├── Season 2/
│   └── Season 3/
│       ├── Attack on Titan - S03E12 [VF].mp4
│       └── Attack on Titan - S03E17 [VF].mp4
└── One Piece/
    └── Season 1/
        └── One Piece - S01E1000 [VOSTFR].mp4
```

### Organization Options

```bash
# Show detailed help for organization
jikan-cli --organize-help

# Preview mode (no files moved)
jikan-cli --organize "./Downloads" --preview

# Interactive mode with manual review
jikan-cli --organize "./Downloads" --interactive

# Custom target directory
jikan-cli --organize "./Downloads" --target "./My Anime Collection"

# Adjust confidence threshold (default: 70)
jikan-cli --organize "./Downloads" --min-confidence 60

# Handle duplicates: skip, rename, or overwrite
jikan-cli --organize "./Downloads" --handle-duplicates rename
```

### What Gets Filtered Out

The tool automatically ignores non-anime files:
- **Music**: `lukrembo - butter (royalty free vlog music).mp4`, `RYLLZ - Nemesis.mp4`
- **Tutorials**: `Dual Boot Bliss OS and Windows Without USB Drive.mp4`
- **Short clips**: `Anime Rage Moment??_#anime #animeedit #animeshorts.mp4`
- **Social content**: `Black Lagoon - Balalaika Edit 🔥.mp4`
- **Design files**: `Web Reservation UI by Muhammad Salim for Fixoria Studio on Dribbble.mp4`
- **Other content**: Files with very low confidence scores

### Safety Features

- **Preview Mode**: See exactly what will happen before any files are moved
- **Confidence Scoring**: Each detection gets a confidence score (0-100%)
- **Interactive Review**: Manually verify questionable matches
- **Duplicate Handling**: Choose how to handle existing files
- **API Validation**: Cross-reference with MyAnimeList database
- **Fallback Names**: Graceful handling when API lookup fails

---

## 🧪 Usage

### Basic Commands

#### Search by Name (Anime - Default)
```bash
jikan-cli -s "naruto"
jikan-cli -s "attack on titan" -l 3 --details
```

#### Search Manga
```bash
jikan-cli --media manga -s "one piece"
jikan-cli --media manga -s "berserk" -l 3 --details
```

#### List Available Genres
```bash
jikan-cli --list-genres                    # Show anime genres
jikan-cli --media manga --list-genres      # Show manga genres
```

#### Get Help
```bash
jikan-cli --help
```

### 🔍 Advanced Search Examples

#### Genre-Specific Search (Anime)
```bash
# Search by single genre
jikan-cli --genre-search "action" -l 5

# Search by multiple genres
jikan-cli --genre-search "action,fantasy" --min-score 8.0

# Include specific genres in regular search
jikan-cli -s "sword" --genres "fantasy,adventure"
```

#### Genre-Specific Search (Manga)
```bash
# Search manga by single genre
jikan-cli --media manga --genre-search "action" -l 5

# Search manga by multiple genres
jikan-cli --media manga --genre-search "action,fantasy" --min-score 8.0

# Include specific genres in manga search
jikan-cli --media manga -s "dragon" --genres "fantasy,adventure"
```

#### Exclude Genres
```bash
# Exclude unwanted content (anime)
jikan-cli -s "school" --exclude-genres "ecchi,harem"

# Exclude unwanted content (manga)
jikan-cli --media manga -s "school" --exclude-genres "ecchi,harem"

# Genre search with exclusions
jikan-cli --genre-search "romance" --exclude-genres "drama" --min-score 7.5
jikan-cli --media manga --genre-search "romance" --exclude-genres "drama" --min-score 7.5
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
# Complex anime search with multiple filters
jikan-cli -s "dragon" \
  --genres "action,fantasy" \
  --exclude-genres "ecchi" \
  --min-score 8.0 \
  --year-range 2015-2023 \
  --type tv \
  --sort score \
  --order desc

# Complex manga search with multiple filters
jikan-cli --media manga -s "dragon" \
  --genres "action,fantasy" \
  --exclude-genres "ecchi" \
  --min-score 8.0 \
  --year-range 2015-2023 \
  --type manga \
  --sort score \
  --order desc

# Genre search with all filters (anime)
jikan-cli --genre-search "romance,comedy" \
  --exclude-genres "harem" \
  --min-score 7.0 \
  --year-range 2020-2024 \
  --interactive

# Genre search with all filters (manga)
jikan-cli --media manga --genre-search "romance,comedy" \
  --exclude-genres "harem" \
  --min-score 7.0 \
  --year-range 2020-2024 \
  --interactive
```

### 🎮 Interactive Mode

```bash
# Interactive anime search - select from a list
jikan-cli -s "naruto" --interactive

# Interactive manga search
jikan-cli --media manga -s "one piece" --interactive

# Interactive genre search (anime)
jikan-cli --genre-search "action,thriller" --interactive

# Interactive genre search (manga)
jikan-cli --media manga --genre-search "action,thriller" --interactive

# Interactive top entries with navigation
jikan-cli -t 10 --interactive                    # Top anime
jikan-cli --media manga -t 10 --interactive      # Top manga

# Interactive seasonal anime (anime only)
jikan-cli -ss 2023 fall --interactive
```

### Traditional Commands

#### Top Entries
```bash
# Top anime
jikan-cli -t 10 --sort members --order desc
jikan-cli -t 20 --exclude-genres "ecchi,harem" --min-score 8.0

# Top manga
jikan-cli --media manga -t 10 --sort score --order desc
jikan-cli --media manga -t 20 --exclude-genres "ecchi,harem" --min-score 8.0
```

#### Seasonal Anime (Anime Only)
```bash
jikan-cli -ss 2023 fall --sort score --order desc
jikan-cli -ss 2024 spring --genres "romance" --interactive
```

#### Random Entry
```bash
jikan-cli -r                      # Random anime
jikan-cli --media manga -r        # Random manga
```

#### Details by ID
```bash
jikan-cli -i 1735                 # Anime details by ID
jikan-cli -mi 13                  # Manga details by ID (One Piece)
```

### 🗂️ File Organization Examples

```bash
# Organization examples
jikan-cli --organize "./Downloads" --preview
jikan-cli --organize "./Downloads" --interactive
jikan-cli --organize "./Downloads" --min-confidence 60
jikan-cli --organize "./Downloads" --target "./Anime Library"
```

---

## 📋 Command Reference

### Media Type Selection
- `-m`, `--media <type>` : Specify media type (anime or manga, default: anime)

### Organization Commands
- `--organize <directory>` : Organize anime files in specified directory
- `--organize-help` : Show detailed organization help and examples
- `--preview` : Show preview without moving files (use with --organize)
- `--target <directory>` : Custom target directory for organized files
- `--min-confidence <0-100>` : Minimum confidence threshold (default: 70)
- `--handle-duplicates <mode>` : How to handle duplicates: skip, rename, overwrite

### Main Commands
- `-s`, `--search <query>` : Search by name
- `-t`, `--top [limit]` : Show top entries (default: 10)
- `-ss`, `--season <year> <season>` : Show anime from specific season (anime only)
- `-r`, `--random` : Show random entry
- `-i`, `--id <id>` : Show anime details by ID
- `-mi`, `--manga-id <id>` : Show manga details by ID
- `-gs`, `--genre-search <genres>` : Search by genres only
- `--list-genres` : Show all available genres
- `--help`, `-h` : Show detailed help information

### Basic Options
- `-l`, `--limit <number>` : Number of results to display (default: 5)
- `-d`, `--details` : Show detailed information including synopsis
- `--interactive` : Enable interactive mode with selectable list

### Basic Filters
- `--type <type>` : Filter by type
  - **Anime**: tv, movie, ova, special, ona, music
  - **Manga**: manga, novel, lightnovel, oneshot, doujin, manhwa, manhua
- `--status <status>` : Filter by status (airing/publishing, completed, upcoming)

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
- `--sort <criteria>` : Sort by
  - **Anime**: score, members, start_date, title, rank, popularity
  - **Manga**: score, members, start_date, title, rank, popularity, chapters, volumes
- `--order <order>` : Sort order (asc, desc - default: desc)

---

## 📸 Example Output

### Interactive Mode (Anime)
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

### Interactive Mode (Manga)
```
📚 Interactive Mode Enabled

Search: "one piece" | Found: 2 results
Use ↑↓ arrows to navigate, Enter to select

? 📋 Select a manga to view details: (Use arrow keys)
❯ 1. One Piece (Unknown year) - ⭐ 9.22 📖 N/A 📚 N/A
  2. Wan Piece (Unknown year) - ⭐ 6.36 📖 N/A 📚 1vol
  ───────────────────────────
  🔙 Go back
  ❌ Exit
```

### Standard Mode (Anime)
```
🔍 Advanced anime search for "jujutsu kaisen" (3 max) - Filters: order=desc:

1. Jujutsu Kaisen (2020)
   Score: 8.54 | Episodes: 24
   https://myanimelist.net/anime/40748/Jujutsu_Kaisen
   🖼️ Image: https://cdn.myanimelist.net/images/anime/1171/109222.jpg
---
...
```

### Standard Mode (Manga)
```
🔍 Advanced manga search for "berserk" (2 max) - Filters: order=desc:

1. Berserk (Unknown year)
   Score: 9.47 | Chapters: N/A | Volumes: N/A
   https://myanimelist.net/manga/2/Berserk
   🖼️ Image: https://cdn.myanimelist.net/images/manga/1/157897.jpg
---
...
```

---

## 🏗️ Project Structure

```
jikan-cli/
├── src/
│   ├── commands/          # Command implementations
│   │   ├── anime-commands.ts    # Anime-specific commands
│   │   ├── manga-commands.ts    # Manga-specific commands
│   │   └── organize-commands.ts # File organization commands
│   ├── services/          # API service layer
│   │   ├── jikan-api.ts         # Jikan API client (anime & manga)
│   │   └── anime-validator.ts   # Anime name validation & enrichment
│   ├── types/             # TypeScript type definitions
│   │   ├── anime.ts             # Type definitions for anime & manga
│   │   └── organize.ts          # Type definitions for file organization
│   ├── utils/             # Utility functions
│   │   ├── args-parser.ts       # Command line argument parsing
│   │   ├── display.ts           # Display utilities for anime & manga
│   │   ├── interactive.ts       # Interactive mode utilities
│   │   ├── advanced-search.ts   # Advanced search & filtering
│   │   ├── file-parser.ts       # Anime file name parsing & classification
│   │   └── directory-manager.ts # File system operations & organization
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

### 🎯 **Priority: Improve File Organization Pattern Recognition**

**The auto-organization feature needs YOUR help to become more accurate!** 

We currently support patterns from major platforms, but anime downloads come in countless filename formats from different sites, regions, and uploaders. To make this feature more comprehensive and precise for all users worldwide, we need more examples.

**🙏 How You Can Help:**

1. **🐛 Open an Issue** if you encounter unrecognized anime files
2. **📝 Provide Pattern Examples** - Include:
   - **Platform name** (e.g., "9anime", "Gogoanime", "Crunchyroll", etc.)
   - **Sample filenames** (at least 3-5 examples from the same source)
   - **Expected parsing** (anime name, season, episode, language)

**📋 Issue Template Example:**
```
**Platform:** Gogoanime
**Filename Examples:**
- Demon Slayer S1 Episode 01 English Dubbed.mp4
- Demon Slayer S1 Episode 02 English Dubbed.mp4
- Demon Slayer S2 Episode 01 English Dubbed.mp4

**Expected Results:**
- Anime: "Demon Slayer"
- Season: 1/2
- Episode: 01/02/01
- Language: English Dubbed
```

**🌍 Especially Needed:**
- **Regional platforms** (non-English anime sites)
- **Mobile app downloads** (unique naming conventions)
- **Batch torrent releases** (season packs, complete series)
- **Streaming site downloaders** (yt-dlp, 4k-downloader, etc.)
- **Fan encoders** (individual uploaders with custom naming)

The more diverse examples we collect, the better the pattern recognition becomes for everyone! Every contribution helps make this tool more universal and accurate.

### 🔧 General Development

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
- [Manga Database](https://myanimelist.net/manga.php)
- [Report Issues](https://github.com/goddivor/jikan-cli/issues)
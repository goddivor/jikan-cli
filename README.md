# 📺 jikan-cli

> A fast and simple CLI application to search for anime using the [Jikan API](https://jikan.moe), written in TypeScript.

---

## 🚀 Features

- **Anime Search** by name (`-s` or `--search`)
- **Top Anime** listing (`-t` or `--top`)
- **Seasonal Anime** (`-ss` or `--season`)
- **Random Anime** (`-r` or `--random`)
- **Anime Details** by ID (`-i` or `--id`)
- **🎮 Interactive Mode** (`--interactive`):
  - Select anime from a navigable list
  - View details without typing IDs
  - Navigate with arrow keys
  - User-friendly menu system
- **Advanced Filtering**:
  - Type: TV, Movie, OVA, Special, ONA, Music
  - Status: Airing, Completed, Upcoming
- **Comprehensive Sorting Options**:
  - Sort by: Score, Members, Start Date, Title, Rank, Popularity
  - Order: Ascending or Descending
- **Rich Display**:
  - Title and year
  - Score and episode count
  - MyAnimeList link
  - Image URL
  - Synopsis (with `--details` flag)
- **Colorized Output** with [chalk](https://www.npmjs.com/package/chalk)

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

### Basic Search

```bash
jikan-cli -s "naruto"
```

### Search with Limit and Details

```bash
jikan-cli -s "attack on titan" -l 3 --details
```

### Advanced Search with Filters and Sorting

```bash
jikan-cli -s "dragon ball" --type movie --sort score --order desc
```

### Interactive Mode (Recommended!)

```bash
# Interactive search - select anime from a list
jikan-cli -s "naruto" --interactive

# Interactive top anime with navigation
jikan-cli -t 10 --interactive

# Interactive seasonal anime
jikan-cli -ss 2023 fall --interactive
```

### Top Anime

```bash
jikan-cli -t 10 --sort members --order desc
```

### Seasonal Anime

```bash
jikan-cli -ss 2023 fall --sort score --order desc
```

### Random Anime

```bash
jikan-cli -r
```

### Anime Details by ID

```bash
jikan-cli -i 1735
```

---

## 📋 Command Reference

### Main Commands
- `-s`, `--search` : Search anime by name
- `-t`, `--top` : Show top anime (default: 10)
- `-ss`, `--season` : Show anime from specific season (year season)
- `-r`, `--random` : Show random anime
- `-i`, `--id` : Show anime details by ID

### Options
- `-l`, `--limit` : Number of results to display (default: 5)
- `-d`, `--details` : Show detailed information including synopsis
- `--interactive` : Enable interactive mode with selectable anime list

### Filters
- `--type` : Filter by type (tv, movie, ova, special, ona, music)
- `--status` : Filter by status (airing, completed, upcoming)

### Sorting
- `--sort` : Sort by criteria (score, members, start_date, title, rank, popularity)
- `--order` : Sort order (asc, desc - default: desc)

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
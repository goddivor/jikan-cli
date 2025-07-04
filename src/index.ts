#!/usr/bin/env node

import chalk from "chalk";

const args = process.argv.slice(2);

const searchIndex = args.findIndex((arg) => arg === "-s" || arg === "--search");
const limitIndex = args.findIndex((arg) => arg === "-l" || arg === "--limit");
const idIndex = args.findIndex((arg) => arg === "-i" || arg === "--id");
const topIndex = args.findIndex((arg) => arg === "-t" || arg === "--top");
const detailsFlag = args.includes("-d") || args.includes("--details");

const query = searchIndex !== -1 ? args[searchIndex + 1] : null;
const limit =
  limitIndex !== -1 && args[limitIndex + 1]
    ? parseInt(args[limitIndex + 1])
    : 5;
const animeId = idIndex !== -1 ? args[idIndex + 1] : null;
const topLimit =
  topIndex !== -1 && args[topIndex + 1] && !args[topIndex + 1].startsWith("-")
    ? parseInt(args[topIndex + 1])
    : 10;

if (animeId) {
  getAnimeDetails(animeId);
} else if (topIndex !== -1) {
  showTopAnimes(topLimit);
} else if (query) {
  searchAnime(query, limit, detailsFlag);
} else {
  console.log(
    chalk.redBright(
      '❌ Usage : jikan-cli -s "nom de l\'anime" [-l nombre_de_resultats] [--details]'
    )
  );
  console.log(chalk.redBright("   ou : jikan-cli -i id_de_l_anime"));
  console.log(chalk.redBright("   ou : jikan-cli --top [n]"));
  process.exit(1);
}

// ========== FONCTIONS PRINCIPALES ==========

async function searchAnime(query: string, limit: number, showDetails: boolean) {
  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=${limit}`;

  try {
    const response = await fetch(url);
    const data = (await response.json()) as { data: any[] };

    if (!data.data || data.data.length === 0) {
      console.log(chalk.yellowBright("😢 Aucun résultat trouvé."));
      return;
    }

    console.log(chalk.cyanBright(`🔍 Résultats pour "${chalk.bold(query)}" (${limit} max) :\n`));

    data.data.forEach((anime: any, index: number) => {
      displayAnime(anime, index, showDetails);
    });
  } catch (error) {
    console.error(chalk.red("❌ Erreur lors de la requête :"), error);
  }
}

async function getAnimeDetails(id: string) {
  const url = `https://api.jikan.moe/v4/anime/${encodeURIComponent(id)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) {
      console.log(chalk.yellowBright("😢 Aucun anime trouvé pour cet ID."));
      return;
    }

    const anime = data.data;

    console.log(chalk.cyanBright(`📋 Détails pour l'anime : ${chalk.bold(anime.title)}\n`));
    console.log(`${chalk.magentaBright("Synopsis")} : ${anime.synopsis ?? "Non disponible"}`);
    console.log(`${chalk.magentaBright("Type")} : ${anime.type ?? "N/A"}`);
    console.log(`${chalk.magentaBright("Episodes")} : ${anime.episodes ?? "N/A"}`);
    console.log(`${chalk.magentaBright("Score")} : ${anime.score ?? "N/A"}`);
    console.log(`${chalk.magentaBright("Statut")} : ${anime.status ?? "N/A"}`);
    console.log(`${chalk.magentaBright("Début diffusion")} : ${anime.aired?.string ?? "N/A"}`);
    console.log(`${chalk.magentaBright("Genres")} : ${anime.genres?.map((g: any) => g.name).join(", ") ?? "N/A"}`);
    console.log(`${chalk.magentaBright("Site")} : ${chalk.blueBright(anime.url)}`);
    console.log(`🖼️ Image : ${chalk.gray(anime.images?.jpg?.image_url || "Non disponible")}`);
  } catch (error) {
    console.error(chalk.red("❌ Erreur lors de la requête :"), error);
  }
}

async function showTopAnimes(limit: number) {
  const url = `https://api.jikan.moe/v4/top/anime?limit=${limit}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log(chalk.yellowBright("😢 Aucun top trouvé."));
      return;
    }

    console.log(chalk.cyanBright(`🏆 Top ${limit} des animés :\n`));

    data.data.forEach((anime: any, index: number) => {
      displayAnime(anime, index, false);
    });
  } catch (error) {
    console.error(chalk.red("❌ Erreur lors de la requête :"), error);
  }
}

// Utilisé par searchAnime et showTopAnimes
function displayAnime(anime: any, index: number, showDetails: boolean) {
  console.log(
    chalk.green(`${index + 1}. ${chalk.bold(anime.title)} (${anime.year || "Année inconnue"})`)
  );
  console.log(
    `   ${chalk.magentaBright("Score")} : ${anime.score ?? "N/A"} | ${chalk.magentaBright("Épisodes")} : ${anime.episodes ?? "N/A"}`
  );
  console.log(`   ${chalk.blueBright(anime.url)}`);
  console.log(`   🖼️ Image : ${chalk.gray(anime.images?.jpg?.image_url || "Non disponible")}`);
  if (showDetails) {
    console.log(`   📝 ${chalk.yellowBright("Synopsis")} : ${anime.synopsis ?? "Non disponible"}`);
  }
  console.log(chalk.gray("---"));
}

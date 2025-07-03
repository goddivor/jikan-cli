#!/usr/bin/env node

import chalk from 'chalk';

const args = process.argv.slice(2);

const searchIndex = args.findIndex(arg => arg === '-s' || arg === '--search');
const limitIndex = args.findIndex(arg => arg === '-l' || arg === '--limit');

const query = searchIndex !== -1 ? args[searchIndex + 1] : null;
const limit = (limitIndex !== -1 && args[limitIndex + 1]) ? parseInt(args[limitIndex + 1]) : 5;

if (!query) {
  console.log(chalk.redBright("❌ Usage : jikan-cli -s \"nom de l'anime\" [-l nombre_de_resultats]"));
  process.exit(1);
}

searchAnime(query, limit);

// ========== MAIN FUNCTION ==========

async function searchAnime(query: string, limit: number) {
  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=${limit}`;

  try {
    const response = await fetch(url);
    const data = await response.json() as { data: any[] };

    if (!data.data || data.data.length === 0) {
      console.log(chalk.yellowBright("😢 Aucun résultat trouvé."));
      return;
    }

    console.log(chalk.cyanBright(`🔍 Résultats pour "${chalk.bold(query)}" (${limit} max) :\n`));

    data.data.forEach((anime: any, index: number) => {
      console.log(chalk.green(`${index + 1}. ${chalk.bold(anime.title)} (${anime.year || 'Année inconnue'})`));
      console.log(`   ${chalk.magentaBright('Score')} : ${anime.score ?? 'N/A'} | ${chalk.magentaBright('Épisodes')} : ${anime.episodes ?? 'N/A'}`);
      console.log(`   ${chalk.blueBright(anime.url)}`);
      console.log(`   🖼️ Image : ${chalk.gray(anime.images?.jpg?.image_url || 'Non disponible')}`);
      console.log(chalk.gray('---'));
    });

  } catch (error) {
    console.error(chalk.red("❌ Erreur lors de la requête :"), error);
  }
}

#!/usr/bin/env node

// Pas besoin de 'import fetch from "node-fetch"'

const args = process.argv.slice(2);
const searchIndex = args.findIndex(arg => arg === '-s' || arg === '--search');

if (searchIndex !== -1 && args[searchIndex + 1]) {
  const query = args[searchIndex + 1];
  searchAnime(query);
} else {
  console.log("Usage : jikan-cli -s \"nom de l'anime\"");
}

async function searchAnime(query: string) {
  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`;

  try {
    const response = await fetch(url); // ✅ natif à Node.js 18+
    const data = await response.json() as { data: any[] };

    if (!data.data || data.data.length === 0) {
      console.log("Aucun résultat trouvé.");
      return;
    }

    console.log(`Résultats pour "${query}" :\n`);
    data.data.forEach((anime: any, index: number) => {
      console.log(`${index + 1}. ${anime.title} (${anime.year || 'Année inconnue'})`);
      console.log(`   Score: ${anime.score} | Episodes: ${anime.episodes}`);
      console.log(`   ${anime.url}`);
      console.log('---');
    });

  } catch (error) {
    console.error("Erreur lors de la requête :", error);
  }
}

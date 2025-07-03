# 📺 jikan-cli

> Une application CLI simple et rapide pour rechercher des animés depuis l'API [Jikan](https://jikan.moe), écrite en TypeScript.

---

## 🚀 Fonctionnalités

- Recherche d'anime par nom (`-s` ou `--search`)
- Définir le nombre de résultats (`-l` ou `--limit`)
- Affichage :
  - Titre
  - Année de sortie
  - Score
  - Nombre d’épisodes
  - Lien vers MyAnimeList
  - Lien de l'image de l'anime
- Résultats stylisés avec [chalk](https://www.npmjs.com/package/chalk)

---

## 📦 Installation

### 1. Cloner le repo et installer les dépendances

```bash
git clone https://github.com/ton-utilisateur/jikan-cli.git
cd jikan-cli
npm install
````

### 2. Compiler le projet

```bash
npm run build
```

### 3. Installer la commande globalement

```bash
npm install -g .
```

---

## 🧪 Utilisation

### Recherche de base

```bash
jikan-cli -s "naruto"
```

### Recherche avec nombre de résultats

```bash
jikan-cli -s "bleach" -l 3
```

### Alias

* `-s`, `--search` : le nom de l'anime
* `-l`, `--limit` : nombre de résultats à afficher (par défaut : 5)

---

## 📸 Exemple de sortie

```
🔍 Résultats pour "dragon ball" (3 max) :

1. Dragon Ball (1986)
   Score : 7.98 | Épisodes : 153
   https://myanimelist.net/anime/223/Dragon_Ball
   🖼️ Image : https://cdn.myanimelist.net/images/anime/13/13225.jpg
---
...
```

---

## 🧱 Structure du projet

```
jikan-cli/
├── src/
│   └── index.ts       # Point d’entrée principal du CLI
├── dist/              # Fichiers compilés
├── package.json       # Dépendances & métadonnées CLI
├── tsconfig.json      # Configuration TypeScript
```

---

## 🛠️ Technologies utilisées

* [TypeScript](https://www.typescriptlang.org/)
* [Node.js](https://nodejs.org/)
* [Jikan API](https://jikan.moe)
* [chalk](https://www.npmjs.com/package/chalk)

---

## 📃 Licence

MIT © 2025 - Créé par [TonNom](https://github.com/ton-utilisateur)

```

---

Souhaites-tu aussi que je te génère le `package.json` prêt pour publication sur npm, ou un logo/bannière CLI stylisé en ASCII art ?
```

## ✅ **Fonctionnalités simples (faciles à implémenter)**

### 1. `--details` pour afficher le synopsis dans les résultats de recherche

> Ajouter un flag pour afficher aussi le synopsis lors des recherches avec `-s`.

```bash
jikan-cli -s "bleach" --details
```

---

### 2. `--top` pour afficher le top 10 (ou plus) des animés

Utiliser [`/top/anime`](https://docs.api.jikan.moe/#tag/top/operation/getTopAnime) de l’API :

```bash
jikan-cli --top 10
```

---

### 3. `--season` pour afficher les animés d’une saison donnée

```bash
jikan-cli --season 2024 spring
```

\=> appelle `/seasons/2024/spring`

---

### 4. `--random` pour obtenir un anime aléatoire

Appelle simplement `/random/anime`

```bash
jikan-cli --random
```

---

## 🧠 Fonctionnalités intermédiaires

### 5. Filtrer par type ou statut (`--type`, `--status`)

Exemples :

```bash
jikan-cli -s "one piece" --type tv --status airing
```

* `--type`: `tv`, `movie`, `ova`, `special`, etc.
* `--status`: `airing`, `completed`, `upcoming`

---

### 6. Ajout d’un mode interactif avec `inquirer`

Permettrait à l'utilisateur de :

* choisir l'anime dans une liste (après une recherche),
* afficher les détails sans taper l'ID.

---

## 🔥 Fonctionnalités avancées

### 7. Historique de recherches

Stocker dans un fichier `.jikan-cli-history.json` local :

```bash
jikan-cli --history
```

---

### 8. Favoris (ajouter/enlever un anime)

```bash
jikan-cli --fav add 16498
jikan-cli --fav list
```

---

### 9. Télécharger l’image ou l’ouvrir dans le navigateur

```bash
jikan-cli --open-image 16498
```

(ouvre l’image dans le navigateur)

---

### 10. Exporter les résultats en JSON

```bash
jikan-cli -s "death note" --export result.json
```

---

## 🧩 Bonus idées (utiles ou fun)

* `--character`: rechercher un personnage (endpoint `/characters`)
* `--studio`: filtrer par studio
* `--manga`: rechercher dans les mangas aussi
* `--nsfw` (filtrage de contenu adulte)

---

Souhaites-tu que je t’aide à **prioriser** ou **implémenter** l’une de ces idées ?

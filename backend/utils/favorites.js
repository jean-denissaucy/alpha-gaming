// Fonctions communes pour nettoyer, formater et sélectionner les jeux favoris.

// Normalise les favoris provenant de sources différentes et supprime les doublons.
export function normalizeFavoriteGames(items = []) {
  // Cette liste permet de conserver un seul jeu par catégorie et par nom.
  const seen = new Set();

  return (Array.isArray(items) ? items : [])
    .map((item) => {
      // Les différentes clés prises en charge assurent la compatibilité avec les réponses SQL et API.
      const gameName = String(item?.game_name ?? item?.title ?? item?.name ?? '').trim();
      const category = String(item?.category ?? item?.category_name ?? (item?.categorie_id ? `Catégorie ${item.categorie_id}` : '')).trim();
      const link = String(item?.link ?? item?.href ?? '').trim();

      // Un favori incomplet ne peut pas être affiché correctement.
      if (!gameName || !category) {
        return null;
      }

      // La comparaison insensible à la casse évite les doublons avec des variations d'écriture.
      const key = `${category.toLowerCase()}::${gameName.toLowerCase()}`;
      if (seen.has(key)) {
        return null;
      }

      seen.add(key);

      // Les propriétés facultatives ne sont ajoutées que lorsqu'elles ont une valeur exploitable.
      return {
        game_name: gameName,
        ...(item?.categorie_id ? { categorie_id: item.categorie_id } : {}),
        category,
        ...(link ? { link } : {})
      };
    })
    .filter(Boolean);
}

// Prépare une charge utile publique en retirant les champs internes inutiles.
export function buildFavoriteGamesPayload(items = []) {
  return normalizeFavoriteGames(items).map(({ game_name, category, link }) => ({
    game_name,
    category,
    ...(link ? { link } : {})
  }));
}

// Renvoie les favoris personnels ou, pour un nouvel utilisateur, tous les favoris disponibles.
export function resolveUserFavoriteGames(userFavorites = [], allFavorites = []) {
  const normalizedUserFavorites = normalizeFavoriteGames(userFavorites);
  const normalizedAllFavorites = normalizeFavoriteGames(allFavorites);

  // Une liste absente ou vide signifie que l'utilisateur n'a pas encore fait de sélection.
  if (!Array.isArray(userFavorites) || userFavorites.length === 0) {
    return normalizedAllFavorites;
  }

  // Si les favoris personnels sont invalides, la liste globale sert de solution de repli.
  return normalizedUserFavorites.length > 0 ? normalizedUserFavorites : normalizedAllFavorites;
}

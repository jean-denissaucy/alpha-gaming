export function normalizeFavoriteGames(items = []) {
  const seen = new Set();

  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const gameName = String(item?.game_name ?? item?.title ?? item?.name ?? '').trim();
      const category = String(item?.category ?? '').trim();
      const link = String(item?.link ?? item?.href ?? '').trim();

      if (!gameName || !category) {
        return null;
      }

      const key = `${category.toLowerCase()}::${gameName.toLowerCase()}`;
      if (seen.has(key)) {
        return null;
      }

      seen.add(key);

      return {
        game_name: gameName,
        category,
        ...(link ? { link } : {})
      };
    })
    .filter(Boolean);
}

export function buildFavoriteGamesPayload(items = []) {
  return normalizeFavoriteGames(items).map(({ game_name, category, link }) => ({
    game_name,
    category,
    ...(link ? { link } : {})
  }));
}

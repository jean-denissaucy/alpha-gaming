import { useEffect, useMemo, useState } from 'react';
import usePageTitle from '../hooks/usePageTitle.js';
import { Heart, ExternalLink, Gamepad2, ArrowRight, ArrowLeft, Star } from 'lucide-react';
import { gamesService } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

const PAGE_SIZE = 25;

export default function Games() {
    // Titre de page dynamique (RGAA 8.6)
    usePageTitle('Catalogue de jeux');
    const [games, setGames] = useState([]);
    const [category, setCategory] = useState('Toutes');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingGameId, setSavingGameId] = useState(null);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [imageErrors, setImageErrors] = useState(new Set());
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        gamesService.getAll()
            .then((data) => {
                const items = Array.isArray(data?.data?.items) ? data.data.items : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
                setGames(items);
            })
            .catch((requestError) => setError(requestError.message || 'Catalogue indisponible.'))
            .finally(() => setLoading(false));
        if (isAuthenticated) {
            gamesService.getFavorites()
                .then((data) => {
                    const items = Array.isArray(data?.data?.items) ? data.data.items : [];
                    setFavoriteIds(new Set(items.map((game) => Number(game.id))));
                })
                .catch(() => {});
        }
    }, [isAuthenticated]);

    const categories = useMemo(() => ['Toutes', ...new Set(games.map((game) => game.category).filter(Boolean))], [games]);
    const visibleGames = category === 'Toutes' ? games : games.filter((game) => game.category === category);
    const gamesWithFavorites = visibleGames.map((game) => ({ ...game, isFavorite: favoriteIds.has(Number(game.id)) }));
    const totalPages = Math.max(1, Math.ceil(visibleGames.length / PAGE_SIZE));

    useEffect(() => setPage(1), [category]);

    const toggleFavorite = async (game) => {
        if (!isAuthenticated) {
            setError('Connectez-vous pour ajouter un jeu à vos favoris.');
            return;
        }
        setSavingGameId(game.id);
        setError('');
        try {
            if (game.isFavorite) await gamesService.removeFavorite(game.id);
            else await gamesService.addFavorite(game.id);
            const nextFavorite = !game.isFavorite;
            setFavoriteIds((current) => {
                const next = new Set(current);
                if (nextFavorite) next.add(Number(game.id));
                else next.delete(Number(game.id));
                return next;
            });
            setGames((current) => current.map((entry) => entry.id === game.id ? { ...entry, isFavorite: nextFavorite } : entry));
        } catch (requestError) {
            setError(requestError.message || 'Impossible de modifier vos favoris.');
        } finally {
            setSavingGameId(null);
        }
    };

    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <section className="news-hero">
                <span className="esport-eyebrow"><i /> ALPHA GAMING LIBRARY</span>
                <h1>Le catalogue <span>gaming.</span></h1>
                <p>Retrouvez tous les jeux, leur catégorie et leur univers.</p>
                {!isAuthenticated && <p className="mt-3 text-amber-200">Connectez-vous pour utiliser les favoris.</p>}
            </section>

            <div className="news-filters my-6">
                {categories.map((entry) => (
                    <button className={category === entry ? 'active' : ''} onClick={() => setCategory(entry)} key={entry}>{entry}</button>
                ))}
            </div>

            {loading ? (
                <p className="news-loading" role="status">Chargement du catalogue…</p>
            ) : error ? (
                <p className="text-rose-300">{error}</p>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                        {gamesWithFavorites.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((game) => {
                            const card = (
                                <>
                                    <div className="group relative aspect-[2/3] overflow-hidden">
                                        {game.image && !imageErrors.has(game.id) ? (
                                            <img className="h-full w-full rounded-t-2xl object-cover transition duration-300 group-hover:scale-105" src={game.image} alt={`Jaquette de ${game.game_name}`} loading="lazy" onError={() => setImageErrors((current) => new Set(current).add(game.id))} />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-t-2xl bg-slate-800">
                                                <Gamepad2 className="h-10 w-10 text-slate-500" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                                        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200 backdrop-blur">
                                            {game.category || `Catégorie ${game.categorie_id}`}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFavorite(game); }}
                                            disabled={savingGameId === game.id || !isAuthenticated}
                                            aria-label={game.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                            className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition ${game.isFavorite ? 'bg-rose-500 text-white' : 'bg-black/60 text-slate-200 hover:bg-rose-500/80 hover:text-white'} ${savingGameId === game.id || !isAuthenticated ? 'opacity-60' : ''}`}
                                        >
                                            <Heart className={`h-4 w-4 ${game.isFavorite ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">{game.category || 'Jeu'}</p>
                                        <h2 className="mt-2 text-base font-bold text-white">{game.game_name}</h2>
                                        {game.release_year != null && (
                                            <p className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-200" title="Année de sortie">
                                                    {game.release_year}
                                                </span>
                                                {game.note == null && (
                                                    <span className="inline-flex items-center rounded-full border border-slate-500/40 bg-slate-500/10 px-2.5 py-1 text-xs font-semibold text-slate-300" title="Sortie à venir">
                                                        À venir
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                        {game.note != null && (
                                            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300" title={`Note : ${game.note} sur 20`}>
                                                <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" aria-hidden="true" />
                                                {Number(game.note).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}/20
                                            </p>
                                        )}
                                    </div>
                                </>
                            );
                            return game.link ? (
                                <a key={game.id} href={game.link} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/75 transition hover:-translate-y-1 hover:border-cyan-400/60">
                                    {card}
                                    <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        <span>Ouvrir</span>
                                        <ExternalLink className="h-3.5 w-3.5 text-cyan-300" />
                                    </div>
                                </a>
                            ) : (
                                <article key={game.id} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/75">
                                    {card}
                                </article>
                            );
                        })}
                    </div>

                    {gamesWithFavorites.length === 0 && <p className="mt-6 text-slate-300">Aucun jeu dans cette catégorie.</p>}

                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
                                <ArrowLeft className="h-4 w-4" /> Précédente
                            </button>
                            <span className="text-sm text-slate-300">Page {page} sur {totalPages}</span>
                            <button className="btn btn-outline" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>
                                Suivante <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}

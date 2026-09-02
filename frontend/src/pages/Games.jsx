import { useEffect, useMemo, useState } from 'react';
import { gamesService } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Games() {
    const [games, setGames] = useState([]);
    const [category, setCategory] = useState('Toutes');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingGameId, setSavingGameId] = useState(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        gamesService.getAll().then((data) => {
            const items = Array.isArray(data?.data?.items) ? data.data.items : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
            setGames(items);
        }).catch((requestError) => setError(requestError.message || 'Catalogue indisponible.')).finally(() => setLoading(false));
    }, []);

    const categories = useMemo(() => ['Toutes', ...new Set(games.map((game) => game.category).filter(Boolean))], [games]);
    const visible = category === 'Toutes' ? games : games.filter((game) => game.category === category);

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
            setGames((current) => current.map((entry) => entry.id === game.id ? { ...entry, isFavorite: !entry.isFavorite } : entry));
        } catch (requestError) {
            setError(requestError.message || 'Connectez-vous pour gérer vos favoris.');
        } finally {
            setSavingGameId(null);
        }
    };

    return <main className="mx-auto max-w-6xl px-6 py-10"><section className="news-hero"><span className="esport-eyebrow"><i /> ALPHA GAMING LIBRARY</span><h1>Le catalogue <span>gaming.</span></h1><p>Retrouvez tous les jeux classés par catégorie et ajoutez vos favoris à votre espace.</p>{!isAuthenticated && <p className="mt-3 text-amber-200">Connectez-vous pour utiliser les favoris.</p>}</section><div className="news-filters my-6">{categories.map((entry) => <button className={category === entry ? 'active' : ''} onClick={() => setCategory(entry)} key={entry}>{entry}</button>)}</div>{loading ? <p>Chargement du catalogue…</p> : error ? <p className="text-rose-300">{error}</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map((game) => <article className="rounded-2xl border border-slate-700 bg-slate-900/75 p-5" key={game.id}><div className="flex items-start justify-between gap-3"><div><span className="text-xs uppercase tracking-widest text-cyan-300">Catégorie {game.categorie_id}</span><h2 className="mt-2 text-xl font-bold text-white">{game.game_name}</h2><p className="mt-1 text-sm text-slate-400">{game.category || 'Catégorie indisponible'}</p></div><label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
<input
 type="checkbox"
 checked={Boolean(game.isFavorite)}
 disabled={savingGameId === game.id || !isAuthenticated}
 onChange={() => toggleFavorite(game)}
 className="h-4 w-4 accent-cyan-400"
/>
<span>{game.isFavorite ? 'Favori' : 'Ajouter aux favoris'}</span>
</label></div>{game.link && <a className="mt-4 inline-block text-sm text-cyan-300" href={game.link} target="_blank" rel="noreferrer">Voir le jeu ↗</a>}</article>)}</div>}</main>;
}

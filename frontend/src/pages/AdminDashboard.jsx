import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { getApiCandidates } from '../services/apiConfig.js';

const apiBase = getApiCandidates(import.meta.env, window.location)[0];

async function adminFetch(path, options = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiBase}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || payload.message || 'Erreur administrateur');
    return payload?.data || payload;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [games, setGames] = useState([]);
    const [form, setForm] = useState({ categoryId: '', gameName: '', link: '' });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const [nextStats, nextGames] = await Promise.all([adminFetch('/admin/stats'), adminFetch('/admin/games')]);
            setStats(nextStats);
            setGames(Array.isArray(nextGames) ? nextGames : nextGames.games || []);
            setError('');
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const submit = async (event) => {
        event.preventDefault();
        try {
            const path = editingId ? `/admin/games/${editingId}` : '/admin/games';
            await adminFetch(path, { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(form) });
            setForm({ categoryId: '', gameName: '', link: '' });
            setEditingId(null);
            await load();
        } catch (err) { setError(err.message); }
    };

    const edit = (game) => {
        setEditingId(game.id);
        setForm({ categoryId: game.categorie_id || '', gameName: game.game_name || '', link: game.link || '' });
    };

    const remove = async (id) => {
        if (!window.confirm('Supprimer ce jeu ?')) return;
        try { await adminFetch(`/admin/games/${id}`, { method: 'DELETE' }); await load(); }
        catch (err) { setError(err.message); }
    };

    return <main className="container page-content">
        <div className="section-heading"><div><span className="eyebrow">Administration</span><h1>Dashboard admin</h1><p>Connecté en tant que {user?.email}</p></div></div>
        {error && <div role="alert" className="alert alert-error">{error}</div>}
        {loading ? <p>Chargement…</p> : <>
            <div className="grid grid-4">
                {['users', 'games', 'news', 'esport'].map((key) => <article className="card" key={key}><span className="eyebrow">{key}</span><strong className="stat-value">{stats?.[key] ?? 0}</strong></article>)}
            </div>
            <section className="card" style={{ marginTop: '2rem' }}><h2>{editingId ? 'Modifier le jeu' : 'Ajouter un jeu'}</h2><form onSubmit={submit} className="form-grid">
                <input required placeholder="Nom du jeu" value={form.gameName} onChange={(e) => setForm({ ...form, gameName: e.target.value })} />
                <input required type="number" min="1" placeholder="ID catégorie" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} />
                <input type="url" placeholder="Lien officiel" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
                <button className="btn btn-primary" type="submit">{editingId ? 'Enregistrer' : 'Ajouter'}</button>
                {editingId && <button className="btn btn-outline" type="button" onClick={() => { setEditingId(null); setForm({ categoryId: '', gameName: '', link: '' }); }}>Annuler</button>}
            </form></section>
            <section className="card" style={{ marginTop: '2rem' }}><h2>Jeux ({games.length})</h2><div className="table-responsive"><table><thead><tr><th>Nom</th><th>Catégorie</th><th>Actions</th></tr></thead><tbody>{games.map((game) => <tr key={game.id}><td>{game.game_name}</td><td>{game.category || game.categorie_id}</td><td><button className="btn btn-outline" onClick={() => edit(game)}>Modifier</button> <button className="btn btn-danger" onClick={() => remove(game.id)}>Supprimer</button></td></tr>)}</tbody></table></div></section>
        </>}
    </main>;
}

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { getApiCandidates } from '../services/apiConfig.js';

const apiBase = getApiCandidates(import.meta.env, window.location)[0];
const emptyForm = { categoryId: '', gameName: '', link: '' };
const statCards = [
    { key: 'users', label: 'Utilisateurs', icon: '◉', tone: 'cyan' },
    { key: 'games', label: 'Jeux catalogués', icon: '▣', tone: 'blue' },
    { key: 'news', label: 'Articles', icon: '◌', tone: 'purple' },
    { key: 'esport', label: 'Matchs esport', icon: '⚡', tone: 'pink' }
];

async function adminFetch(path, options = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiBase}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || payload.message || 'Une erreur est survenue');
    return payload?.data || payload;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [games, setGames] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [usersOpen, setUsersOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

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

    const filteredGames = useMemo(() => games.filter((game) => (game.game_name || '').toLowerCase().includes(search.toLowerCase())), [games, search]);
    const pageSize = 20;
    const totalPages = Math.max(1, Math.ceil(filteredGames.length / pageSize));
    const visibleGames = filteredGames.slice((page - 1) * pageSize, page * pageSize);
    useEffect(() => { setPage(1); }, [search]);
    const loadUsers = async () => { try { const result = await adminFetch('/admin/users'); setUsers(result.users || []); setUsersOpen(true); } catch (err) { setError(err.message); } };

    const submit = async (event) => {
        event.preventDefault(); setSaving(true); setError('');
        try {
            const path = editingId ? `/admin/games/${editingId}` : '/admin/games';
            await adminFetch(path, { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(form) });
            setForm(emptyForm); setEditingId(null); setNotice(editingId ? 'Jeu mis à jour avec succès.' : 'Jeu ajouté au catalogue.'); await load();
        } catch (err) { setError(err.message); } finally { setSaving(false); }
    };
    const edit = (game) => { setEditingId(game.id); setForm({ categoryId: game.categorie_id || '', gameName: game.game_name || '', link: game.link || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const saveUser = async (event) => {
        event.preventDefault();
        try { await adminFetch(`/admin/users/${editingUser.id}`, { method: 'PUT', body: JSON.stringify(editingUser) }); setEditingUser(null); await loadUsers(); setNotice('Utilisateur mis à jour.'); } catch (err) { setError(err.message); }
    };
    const removeUser = async (id) => {
        if (!window.confirm('Supprimer cet utilisateur ?')) return;
        try { await adminFetch(`/admin/users/${id}`, { method: 'DELETE' }); await loadUsers(); setNotice('Utilisateur supprimé.'); } catch (err) { setError(err.message); }
    };
    const remove = async (id) => {
        if (!window.confirm('Supprimer définitivement ce jeu ?')) return;
        try { await adminFetch(`/admin/games/${id}`, { method: 'DELETE' }); setNotice('Jeu supprimé.'); await load(); } catch (err) { setError(err.message); }
    };

    return <main className="admin-shell">
        <section className="admin-hero">
            <div><div className="admin-kicker"><span className="admin-pulse" /> CENTRE DE CONTRÔLE</div><h1>Administration</h1><p>Gérez le contenu d’Alpha Gaming depuis un espace centralisé.</p></div>
            <div className="admin-identity"><span className="admin-avatar">{(user?.firstname || 'A').slice(0, 1).toUpperCase()}</span><div><strong>{user?.firstname || 'Administrateur'}</strong><small>Accès administrateur</small></div><span className="admin-status">EN LIGNE</span></div>
        </section>
        {error && <div className="admin-alert admin-alert-error">⚠ {error}</div>}
        {notice && <div className="admin-alert admin-alert-success">✓ {notice}<button onClick={() => setNotice('')}>×</button></div>}
        <div className="admin-toolbar"><div><span className="admin-label">ESPACE ADMIN</span><p className="admin-muted">Contrôlez les comptes et le contenu de la plateforme.</p></div><button className="admin-button admin-button-primary" onClick={loadUsers}>◉ Gérer les utilisateurs</button></div>
        <section className="admin-stat-grid">{statCards.map((card) => <article className={`admin-stat admin-stat-${card.tone}`} key={card.key}><div className="admin-stat-icon">{card.icon}</div><div><span>{card.label}</span><strong>{loading ? '—' : stats?.[card.key] ?? 0}</strong><small><i /> Données en direct</small></div></article>)}</section>
        <section className="admin-content-grid">
            <article className="admin-panel admin-form-panel"><div className="admin-panel-heading"><div><span className="admin-label">CATALOGUE</span><h2>{editingId ? 'Modifier un jeu' : 'Ajouter un jeu'}</h2></div><span className="admin-heading-mark">＋</span></div><p className="admin-muted">Ajoutez une nouvelle référence au catalogue public.</p><form onSubmit={submit} className="admin-form"><label>Nom du jeu<input required value={form.gameName} placeholder="Ex : Cyberpunk 2077" onChange={(e) => setForm({ ...form, gameName: e.target.value })} /></label><label>Catégorie<input required type="number" min="1" value={form.categoryId} placeholder="ID de catégorie" onChange={(e) => setForm({ ...form, categoryId: e.target.value })} /></label><label>Lien officiel <span>(optionnel)</span><input type="url" value={form.link} placeholder="https://..." onChange={(e) => setForm({ ...form, link: e.target.value })} /></label><div className="admin-form-actions"><button className="admin-button admin-button-primary" disabled={saving}>{saving ? 'Enregistrement…' : editingId ? 'Enregistrer les changements' : 'Ajouter au catalogue'} <span>→</span></button>{editingId && <button className="admin-button admin-button-ghost" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Annuler</button>}</div></form></article>
            <article className="admin-panel admin-quick-panel"><span className="admin-label">ACCÈS RAPIDE</span><h2>État du système</h2><div className="admin-system-row"><span className="admin-system-icon">⌁</span><div><strong>API opérationnelle</strong><small>Services disponibles</small></div><b>OK</b></div><div className="admin-system-row"><span className="admin-system-icon">◈</span><div><strong>Base de données</strong><small>Synchronisation active</small></div><b>OK</b></div><div className="admin-tip"><span>✦</span><p><strong>Conseil</strong><br />Utilisez la recherche pour retrouver rapidement un jeu.</p></div></article>
        </section>
        <section className="admin-panel admin-table-panel"><div className="admin-table-heading"><div><span className="admin-label">GESTION DU CATALOGUE</span><h2>Jeux disponibles <em>{games.length}</em></h2></div><div className="admin-search"><span>⌕</span><input placeholder="Rechercher un jeu…" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>JEU</th><th>CATÉGORIE</th><th>LIEN</th><th>MODIFIÉ</th><th>ACTIONS</th></tr></thead><tbody>{visibleGames.map((game) => <tr key={game.id}><td><div className="admin-game-name"><span className="admin-game-badge">◈</span><strong>{game.game_name}</strong></div></td><td><span className="admin-category">{game.category || `Catégorie ${game.categorie_id}`}</span></td><td>{game.link ? <a className="admin-link" href={game.link} target="_blank" rel="noreferrer">Voir le lien ↗</a> : <span className="admin-muted">—</span>}</td><td><span className="admin-muted">Catalogue</span></td><td><div className="admin-actions"><button title="Modifier" onClick={() => edit(game)}>✎</button><button className="admin-delete" title="Supprimer" onClick={() => remove(game.id)}>⌫</button></div></td></tr>)}</tbody></table>{!loading && filteredGames.length === 0 && <div className="admin-empty">Aucun jeu trouvé.</div>}{totalPages > 1 && <div className="admin-pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>←</button><span>Page <strong>{page}</strong> sur {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</button></div>}</div></section>
        {usersOpen && <div className="admin-modal-backdrop" onClick={() => setUsersOpen(false)}><section className="admin-modal" onClick={(e) => e.stopPropagation()}><div className="admin-modal-header"><div><span className="admin-label">COMPTES</span><h2>Gestion des utilisateurs <em>{users.length}</em></h2></div><button className="admin-modal-close" onClick={() => setUsersOpen(false)}>×</button></div>{editingUser ? <form className="admin-user-form" onSubmit={saveUser}><input required value={editingUser.firstname} placeholder="Prénom" onChange={(e) => setEditingUser({ ...editingUser, firstname: e.target.value })}/><input required value={editingUser.lastname} placeholder="Nom" onChange={(e) => setEditingUser({ ...editingUser, lastname: e.target.value })}/><input required type="email" value={editingUser.email} placeholder="Email" onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}/><select value={editingUser.role || 'user'} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}><option value="user">Utilisateur</option><option value="admin">Administrateur</option></select><button className="admin-button admin-button-primary">Enregistrer</button><button type="button" className="admin-button admin-button-ghost" onClick={() => setEditingUser(null)}>Annuler</button></form> : <div className="admin-users-list">{users.map((item) => <div className="admin-user-row" key={item.id}><span className="admin-avatar admin-avatar-small">{(item.firstname || 'U').slice(0,1).toUpperCase()}</span><div><strong>{item.firstname} {item.lastname}</strong><small>{item.email}</small></div><span className={`admin-role admin-role-${item.role}`}>{item.role || 'user'}</span><button onClick={() => setEditingUser(item)}>✎</button><button className="admin-delete" onClick={() => removeUser(item.id)}>⌫</button></div>)}</div>}</section></div>}
    </main>;
}

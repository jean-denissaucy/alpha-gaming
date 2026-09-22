import { useEffect, useMemo, useState } from 'react';
import usePageTitle from '../hooks/usePageTitle.js';
import useFocusTrap from '../hooks/useFocusTrap.js';
import {
    Users, Gamepad2, Newspaper, Trophy, AlertCircle, CheckCircle, X, Plus,
    ArrowRight, ArrowLeft, Search, Pencil, Trash2, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { getApiCandidates } from '../services/apiConfig.js';

const apiBase = getApiCandidates(import.meta.env, window.location)[0];
const emptyForm = { categoryId: '', gameName: '', link: '', image: '' };
// Cartes de statistiques : les valeurs viennent de l'API (/admin/stats), la config (libellés + icônes) vit ici.
const STAT_CARDS = [
    { key: 'users', label: 'Utilisateurs', Icon: Users },
    { key: 'games', label: 'Jeux catalogués', Icon: Gamepad2 },
    { key: 'news', label: 'Articles', Icon: Newspaper },
    { key: 'esport', label: 'Matchs esport', Icon: Trophy }
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
    // Titre de page dynamique (RGAA 8.6)
    usePageTitle('Administration');
    const [stats, setStats] = useState(null);
    const [games, setGames] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [gameModalOpen, setGameModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState([]);
    const [usersOpen, setUsersOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // RGAA 7.3 : focus piégé dans les modales (Tab enfermé, Échap ferme, focus restitué à la fermeture).
    const gameModalRef = useFocusTrap(gameModalOpen, closeGameModal);
    const usersModalRef = useFocusTrap(usersOpen, () => setUsersOpen(false));

    const load = async () => {
        setLoading(true);
        try {
            const [nextStats, nextGames] = await Promise.all([adminFetch('/admin/stats'), adminFetch('/admin/games')]);
            const list = Array.isArray(nextGames) ? nextGames : nextGames.games || [];
            setStats(nextStats);
            setGames(list);
            // Déduplique les catégories rencontrées dans le catalogue (id + nom).
            const byId = new Map();
            list.forEach((game) => {
                if (game.categorie_id != null && !byId.has(Number(game.categorie_id))) {
                    byId.set(Number(game.categorie_id), {
                        id: Number(game.categorie_id),
                        name: game.category || `Catégorie ${game.categorie_id}`
                    });
                }
            });
            setCategories([...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr')));
            setError('');
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const filteredGames = useMemo(
        () => games.filter((game) => {
            const haystack = `${game.game_name || ''} ${game.category || ''}`.toLowerCase();
            return haystack.includes(search.toLowerCase());
        }),
        [games, search]
    );
    const pageSize = 20;
    const totalPages = Math.max(1, Math.ceil(filteredGames.length / pageSize));
    const visibleGames = filteredGames.slice((page - 1) * pageSize, page * pageSize);
    useEffect(() => { setPage(1); }, [search]);

    // ==== Modal ajout / édition de jeu ====
    const openAdd = () => { setEditingId(null); setForm(emptyForm); setGameModalOpen(true); };
    const openEdit = (game) => {
        setEditingId(game.id);
        setForm({ categoryId: String(game.categorie_id ?? ''), gameName: game.game_name || '', link: game.link || '', image: game.image || '' });
        setGameModalOpen(true);
    };
    const closeGameModal = () => { setGameModalOpen(false); setEditingId(null); setForm(emptyForm); };

    const submit = async (event) => {
        event.preventDefault(); setSaving(true); setError('');
        try {
            const path = editingId ? `/admin/games/${editingId}` : '/admin/games';
            await adminFetch(path, { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(form) });
            setNotice(editingId ? 'Jeu mis à jour avec succès.' : 'Jeu ajouté au catalogue.');
            closeGameModal();
            await load();
        } catch (err) { setError(err.message); } finally { setSaving(false); }
    };
    const remove = async (id) => {
        if (!window.confirm('Supprimer définitivement ce jeu ?')) return;
        try { await adminFetch(`/admin/games/${id}`, { method: 'DELETE' }); setNotice('Jeu supprimé.'); await load(); }
        catch (err) { setError(err.message); }
    };

    // ==== Utilisateurs ====
    const loadUsers = async () => {
        try { const result = await adminFetch('/admin/users'); setUsers(result.users || []); setUsersOpen(true); }
        catch (err) { setError(err.message); }
    };
    const saveUser = async (event) => {
        event.preventDefault();
        try {
            await adminFetch(`/admin/users/${editingUser.id}`, { method: 'PUT', body: JSON.stringify(editingUser) });
            setEditingUser(null); await loadUsers(); setNotice('Utilisateur mis à jour.');
        } catch (err) { setError(err.message); }
    };
    const removeUser = async (id) => {
        if (!window.confirm('Supprimer cet utilisateur ?')) return;
        try { await adminFetch(`/admin/users/${id}`, { method: 'DELETE' }); await loadUsers(); setNotice('Utilisateur supprimé.'); }
        catch (err) { setError(err.message); }
    };

    return <main className="admin-shell">
        <section className="admin-hero">
            <div>
                <div className="admin-kicker"><span className="admin-pulse" /> CENTRE DE CONTRÔLE</div>
                <h1>Administration</h1>
                <p>Gérez le catalogue, les comptes et le contenu d’Alpha Gaming.</p>
            </div>
        </section>

        {error && <div className="admin-alert admin-alert-error"><AlertCircle className="h-4 w-4" /> {error}</div>}
        {notice && <div className="admin-alert admin-alert-success"><CheckCircle className="h-4 w-4" /> {notice}<button onClick={() => setNotice('')}><X className="h-4 w-4" /></button></div>}

        <div className="admin-toolbar">
            <div>
                <span className="admin-label">ESPACE ADMIN</span>
                <p className="admin-muted">Contrôlez les comptes et le contenu de la plateforme.</p>
            </div>
            <button className="admin-button admin-button-primary" onClick={loadUsers}><Users className="h-4 w-4" /> Gérer les utilisateurs</button>
        </div>

        <section className="admin-stat-grid">
            {STAT_CARDS.map((card) => (
                <article className="admin-stat" key={card.key}>
                    <div className="admin-stat-icon"><card.Icon className="h-6 w-6" /></div>
                    <div>
                        <span>{card.label}</span>
                        <strong>{loading ? '—' : stats?.[card.key] ?? 0}</strong>
                    </div>
                </article>
            ))}
        </section>

        <section className="admin-panel admin-table-panel">
            <div className="admin-table-heading">
                <div>
                    <span className="admin-label">GESTION DU CATALOGUE</span>
                    <h2>Jeux disponibles <em>{games.length}</em></h2>
                </div>
                <div className="admin-table-tools">
                    <div className="admin-search">
                        <Search className="h-4 w-4" />
                        <input placeholder="Rechercher un jeu…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button className="admin-button admin-button-primary" onClick={openAdd}>
                        <Plus className="h-4 w-4" /> Ajouter un jeu
                    </button>
                </div>
            </div>
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr><th>JEU</th><th>CATÉGORIE</th><th>LIEN</th><th className="admin-th-actions">ACTIONS</th></tr>
                    </thead>
                    <tbody>
                        {visibleGames.map((game) => (
                            <tr key={game.id}>
                                <td>
                                    <div className="admin-game-cell">
                                        {game.image
                                            ? <img className="admin-game-cover" src={game.image} alt={game.game_name} loading="lazy" />
                                            : <span className="admin-game-cover admin-game-cover-empty"><ImageIcon className="h-4 w-4" /></span>}
                                        <strong>{game.game_name}</strong>
                                    </div>
                                </td>
                                <td><span className="admin-category">{game.category || `Catégorie ${game.categorie_id}`}</span></td>
                                <td>{game.link
                                    ? <a className="admin-link" href={game.link} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Ouvrir</a>
                                    : <span className="admin-muted">—</span>}</td>
                                <td>
                                    <div className="admin-actions">
                                        <button title="Modifier" onClick={() => openEdit(game)}><Pencil className="h-4 w-4" /></button>
                                        <button className="admin-delete" title="Supprimer" onClick={() => remove(game.id)}><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && filteredGames.length === 0 && <div className="admin-empty">Aucun jeu trouvé.</div>}
                {totalPages > 1 && (
                    <div className="admin-pagination">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Page précédente"><ArrowLeft className="h-4 w-4" /></button>
                        <span>Page <strong>{page}</strong> sur {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} aria-label="Page suivante"><ArrowRight className="h-4 w-4" /></button>
                    </div>
                )}
            </div>
        </section>

        {gameModalOpen && (
            <div className="admin-modal-backdrop" onClick={closeGameModal}>
                {/* Modale accessible (RGAA 7.1 / 7.3) : role=dialog + aria-modal + libellé relié au titre */}
                <section
                    ref={gameModalRef}
                    tabIndex={-1}
                    className="admin-modal admin-modal-game"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="game-modal-title"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="admin-modal-header">
                        <div>
                            <span className="admin-label">CATALOGUE</span>
                            <h2 id="game-modal-title">{editingId ? 'Modifier un jeu' : 'Ajouter un jeu'}</h2>
                        </div>
                        <button className="admin-modal-close" onClick={closeGameModal} aria-label="Fermer"><X className="h-5 w-5" /></button>
                    </div>
                    <form onSubmit={submit} className="admin-form">
                        <label>Nom du jeu
                            <input required value={form.gameName} placeholder="Ex : Cyberpunk 2077" onChange={(e) => setForm({ ...form, gameName: e.target.value })} />
                        </label>
                        <label>Catégorie
                            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                                <option value="" disabled>Sélectionner une catégorie…</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </label>
                        <label>Lien officiel <span>(optionnel)</span>
                            <input type="url" value={form.link} placeholder="https://…" onChange={(e) => setForm({ ...form, link: e.target.value })} />
                        </label>
                        <label>Image / jaquette <span>(URL https://…)</span>
                            <input type="url" value={form.image} placeholder="https://…/cover.jpg" onChange={(e) => setForm({ ...form, image: e.target.value })} />
                        </label>
                        {form.image && <div className="admin-form-preview"><img src={form.image} alt="Aperçu de la jaquette" /></div>}
                        <div className="admin-form-actions">
                            <button className="admin-button admin-button-primary" disabled={saving}>
                                {saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Ajouter au catalogue'} <ArrowRight className="h-4 w-4" />
                            </button>
                            <button className="admin-button admin-button-ghost" type="button" onClick={closeGameModal}>Annuler</button>
                        </div>
                    </form>
                </section>
            </div>
        )}

        {usersOpen && (
            <div className="admin-modal-backdrop" onClick={() => setUsersOpen(false)}>
                {/* Modale accessible (RGAA 7.1 / 7.3) */}
                <section
                    ref={usersModalRef}
                    tabIndex={-1}
                    className="admin-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="users-modal-title"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="admin-modal-header">
                        <div>
                            <span className="admin-label">COMPTES</span>
                            <h2 id="users-modal-title">Gestion des utilisateurs <em>{users.length}</em></h2>
                        </div>
                        <button className="admin-modal-close" onClick={() => setUsersOpen(false)} aria-label="Fermer"><X className="h-5 w-5" /></button>
                    </div>
                    {editingUser ? (
                        <form className="admin-user-form" onSubmit={saveUser}>
                            {/* aria-label car pas de label visible : les champs restent nommés pour les lecteurs d'écran (RGAA 11.1) */}
                            <input required aria-label="Prénom" value={editingUser.firstname} placeholder="Prénom" onChange={(e) => setEditingUser({ ...editingUser, firstname: e.target.value })} />
                            <input required aria-label="Nom" value={editingUser.lastname} placeholder="Nom" onChange={(e) => setEditingUser({ ...editingUser, lastname: e.target.value })} />
                            <input required type="email" aria-label="Email" value={editingUser.email} placeholder="Email" onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
                            <select aria-label="Rôle du compte" value={editingUser.role || 'user'} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                                <option value="user">Utilisateur</option>
                                <option value="admin">Administrateur</option>
                            </select>
                            <button className="admin-button admin-button-primary">Enregistrer</button>
                            <button type="button" className="admin-button admin-button-ghost" onClick={() => setEditingUser(null)}>Annuler</button>
                        </form>
                    ) : (
                        <div className="admin-users-list">
                            {users.map((item) => (
                                <div className="admin-user-row" key={item.id}>
                                    <span className="admin-avatar admin-avatar-small">{(item.firstname || 'U').slice(0, 1).toUpperCase()}</span>
                                    <div><strong>{item.firstname} {item.lastname}</strong><small>{item.email}</small></div>
                                    <span className={`admin-role admin-role-${item.role}`}>{item.role || 'user'}</span>
                                    <button aria-label={`Modifier ${item.firstname} ${item.lastname}`} title="Modifier" onClick={() => setEditingUser(item)}><Pencil className="h-4 w-4" /></button>
                                    <button className="admin-delete" aria-label={`Supprimer ${item.firstname} ${item.lastname}`} title="Supprimer" onClick={() => removeUser(item.id)}><Trash2 className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        )}
    </main>;
}

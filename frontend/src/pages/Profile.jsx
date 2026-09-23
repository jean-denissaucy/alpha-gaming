import { useEffect, useState } from 'react';
import { Heart, Gamepad2, ExternalLink, Mail, Calendar, User, ShieldCheck, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import usePageTitle from '../hooks/usePageTitle.js';
import { authService, gamesService } from '../services/api.js';

export default function Profile() {
    // Titre de page dynamique (RGAA 8.6)
    usePageTitle('Mon profil');
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Changement de mot de passe
    const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
    const [pwdFeedback, setPwdFeedback] = useState(null); // { type: 'success' | 'error', message }
    const [pwdSaving, setPwdSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            try {
                const [profileData, gamesData] = await Promise.all([
                    authService.getProfile(),
                    gamesService.getAll()
                ]);
                if (!isMounted) return;

                const userInfo = profileData?.user || profileData?.data?.user || null;
                setProfile(userInfo);

                const catalog = Array.isArray(gamesData?.data?.items)
                    ? gamesData.data.items
                    : Array.isArray(gamesData?.data)
                        ? gamesData.data
                        : Array.isArray(gamesData)
                            ? gamesData
                            : [];

                const favoriteIds = new Set((userInfo?.favorite_games || []).map((game) => Number(game.id)));
                setFavorites(catalog.filter((game) => favoriteIds.has(Number(game.id))));
                setError('');
            } catch (err) {
                if (!isMounted) return;
                setError(err?.message || 'Impossible de charger le profil.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();
        return () => { isMounted = false; };
    }, []);

    // Change le mot de passe : validation locale alignée sur le serveur, puis appel API.
    const handlePasswordChange = async (event) => {
        event.preventDefault();
        if (pwdSaving) return;

        if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) {
            setPwdFeedback({ type: 'error', message: 'Veuillez remplir les trois champs.' });
            return;
        }
        if (pwdForm.next.length < 8) {
            setPwdFeedback({ type: 'error', message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
            return;
        }
        if (pwdForm.next === pwdForm.current) {
            setPwdFeedback({ type: 'error', message: 'Le nouveau mot de passe doit être différent du mot de passe actuel.' });
            return;
        }
        if (pwdForm.next !== pwdForm.confirm) {
            setPwdFeedback({ type: 'error', message: 'La confirmation ne correspond pas au nouveau mot de passe.' });
            return;
        }

        try {
            setPwdSaving(true);
            const response = await authService.changePassword(pwdForm.current, pwdForm.next);
            const message = response?.data?.message || 'Mot de passe modifié avec succès';
            setPwdFeedback({ type: 'success', message });
            setPwdForm({ current: '', next: '', confirm: '' });
        } catch (err) {
            setPwdFeedback({ type: 'error', message: err?.message || 'Impossible de changer le mot de passe.' });
        } finally {
            setPwdSaving(false);
        }
    };

    const displayUser = profile || user;
    const createdAt = displayUser?.created_at;
    const createdAtLabel = createdAt ? new Date(createdAt).toLocaleDateString('fr-FR') : 'Non disponible';

    return (
        <div className="relative mx-auto max-w-6xl px-6 py-16 text-slate-100">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 rounded-[2.2rem] bg-linear-to-br from-cyan-500/14 via-slate-900/20 to-blue-500/12" />

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-widest text-cyan-200/80">Espace personnel</p>
                    <h1 className="text-3xl font-semibold text-white">Mon profil</h1>
                    <p className="mt-2 text-sm text-slate-300">Vos informations et vos jeux favoris.</p>
                </div>
                <button onClick={logout} className="btn btn-outline inline-flex items-center gap-2"><LogOut className="h-4 w-4" /> Déconnexion</button>
            </div>

            <div className="mt-10">
                <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/80 p-6 shadow-[0_24px_60px_-32px_rgba(0,167,255,0.4)] backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white">
                                {(displayUser?.firstname || displayUser?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-white">
                                    {displayUser?.firstname || '—'} {displayUser?.lastname || ''}
                                </p>
                                <p className="text-sm text-slate-400">{displayUser?.email || '—'}</p>
                            </div>
                        </div>
                        {displayUser?.role === 'admin' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/35 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100"><ShieldCheck className="h-4 w-4" /> Administrateur</span>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
                    )}

                    {!loading && !error && (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300"><User className="h-4 w-4" /></span>
                                <p className="mt-3 text-xs uppercase text-slate-400">Prénom</p>
                                <p className="mt-1 text-sm text-white">{displayUser?.firstname || '—'}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300"><User className="h-4 w-4" /></span>
                                <p className="mt-3 text-xs uppercase text-slate-400">Nom</p>
                                <p className="mt-1 text-sm text-white">{displayUser?.lastname || '—'}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300"><Mail className="h-4 w-4" /></span>
                                <p className="mt-3 text-xs uppercase text-slate-400">Email</p>
                                <p className="mt-1 truncate text-sm text-white">{displayUser?.email || '—'}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300"><Calendar className="h-4 w-4" /></span>
                                <p className="mt-3 text-xs uppercase text-slate-400">Membre depuis</p>
                                <p className="mt-1 text-sm text-white">{createdAtLabel}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs uppercase text-slate-400">Mes jeux favoris</p>
                            <span className="text-xs text-slate-400">{favorites.length} jeu(x)</span>
                        </div>

                        {favorites.length > 0 ? (
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {favorites.map((game) => (
                                    <div key={game.id} className="group overflow-hidden rounded-xl border border-slate-700 bg-slate-950/70 transition hover:border-cyan-400/50">
                                        {game.link ? (
                                            <a href={game.link} target="_blank" rel="noreferrer" className="block">
                                                <div className="relative aspect-[2/3] overflow-hidden">
                                                    {game.image ? (
                                                        <img className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={game.image} alt={`Jaquette de ${game.game_name}`} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-slate-800"><Gamepad2 className="h-8 w-8 text-slate-500" /></div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                                                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-cyan-200 backdrop-blur">
                                                        <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> 
                                                        {game.game_name}
                                                    </span>
                                                    <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-200"><ExternalLink className="h-3.5 w-3.5" /></span>
                                                </div>
                                            </a>
                                        ) : (
                                            <div className="relative aspect-[2/3] overflow-hidden">
                                                {game.image ? (
                                                    <img className="h-full w-full object-cover" src={game.image} alt={`Jaquette de ${game.game_name}`} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-slate-800"><Gamepad2 className="h-8 w-8 text-slate-500" /></div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                                                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-cyan-200 backdrop-blur">
                                                    <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> 
                                                    {game.game_name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-sm text-slate-300">Aucun jeu favori enregistré.</p>
                        )}
                    </div>

                    {/* Changement de mot de passe (RGAA : labels reliés, autocomplete, annonces) */}
                    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300"><KeyRound className="h-4 w-4" /></span>
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Changer mon mot de passe</h2>
                                <p className="mt-0.5 text-xs text-slate-400">Minimum 8 caractères. Vos mots de passe sont chiffrés (bcrypt), même l'équipe ne peut pas les lire.</p>
                            </div>
                        </div>

                        <form className="mt-4 grid gap-4 sm:grid-cols-3" onSubmit={handlePasswordChange} noValidate>
                            <div>
                                <label htmlFor="pwd-current" className="text-xs uppercase tracking-wide text-slate-400">Mot de passe actuel</label>
                                <input
                                    id="pwd-current"
                                    type="password"
                                    className="input mt-2"
                                    value={pwdForm.current}
                                    autoComplete="current-password"
                                    onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="pwd-next" className="text-xs uppercase tracking-wide text-slate-400">Nouveau mot de passe</label>
                                <input
                                    id="pwd-next"
                                    type="password"
                                    className="input mt-2"
                                    value={pwdForm.next}
                                    autoComplete="new-password"
                                    onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
                                    required
                                    minLength={8}
                                />
                            </div>
                            <div>
                                <label htmlFor="pwd-confirm" className="text-xs uppercase tracking-wide text-slate-400">Confirmer le nouveau</label>
                                <input
                                    id="pwd-confirm"
                                    type="password"
                                    className="input mt-2"
                                    value={pwdForm.confirm}
                                    autoComplete="new-password"
                                    onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                                    required
                                    minLength={8}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
                                <button type="submit" className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60" disabled={pwdSaving}>
                                    {pwdSaving ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
                                </button>
                                {pwdFeedback && (
                                    <p
                                        role={pwdFeedback.type === 'error' ? 'alert' : 'status'}
                                        className={pwdFeedback.type === 'error'
                                            ? 'text-sm font-medium text-red-300'
                                            : 'text-sm font-medium text-emerald-300'}
                                    >
                                        {pwdFeedback.message}
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

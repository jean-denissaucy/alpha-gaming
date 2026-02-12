// pages/Dashboard.jsx - Page du tableau de bord (route protégée)

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { authService } from '../services/api.js';

function Dashboard() {
    // Récupération de l'utilisateur et de la fonction logout depuis le contexte
    const { user, logout } = useAuth();

    // États pour gérer le profil, le chargement et les erreurs
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fonction pour charger le profil depuis l'API protégée
    const loadProfile = async () => {
        setLoading(true);
        try {
            // Appel de l'endpoint protégé /api/auth/me
            const data = await authService.getProfile();
            setProfile(data.user);
            setError('');
        } catch (err) {
            setError(err.message || 'Impossible de charger le profil');
        } finally {
            setLoading(false);
        }
    };

    // Chargement du profil au montage du composant
    useEffect(() => {
        loadProfile();
    }, []);

    // Sélection du profil à afficher (depuis l'API ou depuis le contexte)
    const displayUser = profile || user;

    // Formatage de la date de création du compte
    const createdAt = displayUser?.created_at;
    const createdAtLabel = createdAt
        ? new Date(createdAt).toLocaleDateString('fr-FR')
        : 'Non disponible';

    return (
        <div className="mx-auto max-w-6xl px-6 py-16">
            {/* En-tête avec titre et bouton de déconnexion */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-widest text-slate-500">Tableau de bord</p>
                    <h1 className="text-3xl font-semibold text-slate-900">Bon retour</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Donnees chargees depuis le endpoint protege /api/auth/me.
                    </p>
                </div>
                <button onClick={logout} className="btn btn-outline">
                    Deconnexion
                </button>
            </div>

            {/* Grille avec informations du profil et actions rapides */}
            <div className="mt-10 grid gap-6 md:grid-cols-3">
                {/* Carte principale - Informations du profil */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">Profil</h2>
                        {/* Bouton pour rafraîchir le profil */}
                        <button
                            onClick={loadProfile}
                            disabled={loading}
                            className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Chargement...' : 'Rafraichir'}
                        </button>
                    </div>

                    {/* Affichage des erreurs */}
                    {error && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Grille des informations utilisateur */}
                    {!error && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4">
                                <p className="text-xs uppercase text-slate-500">Nom</p>
                                <p className="mt-2 text-sm text-slate-900">
                                    {displayUser?.firstname || '—'} {displayUser?.lastname || ''}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4">
                                <p className="text-xs uppercase text-slate-500">Email</p>
                                <p className="mt-2 text-sm text-slate-900">{displayUser?.email || '—'}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4">
                                <p className="text-xs uppercase text-slate-500">Membre depuis</p>
                                <p className="mt-2 text-sm text-slate-900">{createdAtLabel}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4">
                                <p className="text-xs uppercase text-slate-500">Statut</p>
                                <p className="mt-2 text-sm text-slate-900">Actif</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Carte secondaire - Actions rapides */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">Actions rapides</h2>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <button className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-left transition hover:border-slate-300">
                            Exporter mes infos
                        </button>
                        <button className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-left transition hover:border-slate-300">
                            Gerer mon profil
                        </button>
                        <button className="w-full rounded-xl border border-slate-200 bg-stone-50 px-4 py-3 text-left transition hover:border-slate-300">
                            Voir la documentation API
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

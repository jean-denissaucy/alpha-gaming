// pages/Home.jsx - Page d'accueil publique

import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function Home() {
    // Vérification si l'utilisateur est connecté pour adapter l'affichage
    const { isAuthenticated } = useAuth();

    return (
        <div className="relative">

            {/* Section héro avec gradient d'arrière-plan */}
            <section className="relative overflow-hidden">

                {/* Effets de gradient en arrière-plan */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/70 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-200/70 blur-3xl" />

                {/* Contenu principal du héro */}
                <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
                    <div className="max-w-2xl">
                        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs uppercase tracking-widest text-slate-600">
                            Starter Kit MERM
                        </p>
                        <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                            Lance ton produit vite, avec une authentification propre.
                        </h1>
                        <p className="mt-4 text-base text-slate-600 sm:text-lg">
                            Stack MERM minimaliste avec JWT, routes protegees et UI Tailwind soignee pour passer direct en production.
                        </p>

                        {/* Boutons d'action adaptés selon l'état d'authentification */}
                        <div className="mt-8 flex flex-wrap gap-4">
                            {isAuthenticated ? (
                                <Link className="btn btn-primary" to="/dashboard">
                                    Acceder au tableau de bord
                                </Link>
                            ) : (
                                <>
                                    <Link className="btn btn-primary" to="/register">
                                        Creer un compte
                                    </Link>
                                    <Link className="btn btn-outline" to="/login">
                                        Se connecter
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section des fonctionnalités - Grille avec 3 cartes */}
            <section className="mx-auto max-w-6xl px-6 pb-20">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold">Inscription fluide</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Formulaire simple, validation et retour direct depuis l'API.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold">Connexion separee</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Jeton JWT stocke et re-utilise pour les routes protegees.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold">Profil protege</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Donnees recuperees depuis /api/auth/me uniquement si connecte.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;

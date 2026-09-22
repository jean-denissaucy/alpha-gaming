// pages/Login.jsx - Page de connexion

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import usePageTitle from '../hooks/usePageTitle.js';

function Login() {
    // Titre de page dynamique (RGAA 8.6)
    usePageTitle('Connexion');
    // États pour gérer les champs du formulaire
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // États pour gérer les erreurs et le chargement
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Hooks d'authentification, navigation et localisation
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Récupération de la page d'origine si redirection depuis PrivateRoute
    const from = location.state?.from?.pathname || '/dashboard';

    // Gestion de la soumission du formulaire de connexion
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Réinitialisation de l'erreur et activation du loader
        setError('');
        setLoading(true);

        try {
            // Appel de la fonction de connexion depuis le contexte
            await login(email, password);

            // Redirection vers la page d'origine ou le dashboard
            navigate(from, { replace: true });
        } catch (err) {
            const message = err?.message || 'Erreur de connexion';
            setError(message);
        } finally {
            // Désactivation du loader
            setLoading(false);
        }
    };
    return (
        <div className="mx-auto max-w-6xl px-6 py-16 text-slate-100">
            <div className="flex items-center">
                <div className="grid w-full gap-10 lg:grid-cols-2">

                    {/* Colonne gauche - Informations */}
                    <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/80 p-8 shadow-[0_24px_60px_-32px_rgba(0,167,255,0.38)] backdrop-blur">
                        <h1 className="text-3xl font-semibold text-white">Connexion</h1>
                    </div>

                    {/* Colonne droite - Formulaire de connexion */}
                    <form onSubmit={handleSubmit} className="rounded-3xl border border-cyan-400/15 bg-slate-950/80 p-8 shadow-[0_24px_60px_-32px_rgba(0,167,255,0.38)] backdrop-blur">

                        {/* Champ email — label associé (RGAA 11.1) + autocomplete (RGAA 11.13) */}
                        <div>
                            <label htmlFor="login-email" className="text-xs uppercase tracking-wide text-slate-400">Email</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className="input mt-2"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="jane@company.com"
                            />
                        </div>

                        {/* Champ mot de passe */}
                        <div className="mt-4">
                            <label htmlFor="login-password" className="text-xs uppercase tracking-wide text-slate-400">Mot de passe</label>
                            <input
                                id="login-password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                className="input mt-2"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Ton mot de passe"
                            />
                        </div>

                        {/* Affichage de l'erreur si présente — annoncé automatiquement par les lecteurs d'écran (RGAA 11.10) */}
                        {error && (
                            <div role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        {/* Bouton de soumission avec état de chargement */}
                        <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60">
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>

                        {/* Lien vers la page d'inscription */}
                        <p className="mt-4 text-sm text-slate-300">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="font-semibold text-cyan-200 hover:text-cyan-100">
                                S'inscrire
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Login;
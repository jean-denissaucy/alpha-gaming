// pages/Login.jsx - Page de connexion

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function Login() {
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
            // Affichage de l'erreur en cas d'échec
            setError(err.message || 'Erreur de connexion');
        } finally {
            // Désactivation du loader
            setLoading(false);
        }
    };
    return (
        <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex items-center">
                <div className="grid w-full gap-10 lg:grid-cols-2">

                    {/* Colonne gauche - Informations */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        <h1 className="text-3xl font-semibold text-slate-900">Connexion</h1>
                        <p className="mt-3 text-sm text-slate-600">
                            Accede au tableau de bord avec tes identifiants.
                        </p>
                        <ul className="mt-6 space-y-3 text-sm text-slate-600">
                            <li>Session securisee avec JWT</li>
                            <li>Acces aux routes protegees</li>
                            <li>Interface React + Tailwind</li>
                        </ul>
                    </div>

                    {/* Colonne droite - Formulaire de connexion */}
                    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

                        {/* Champ email */}
                        <div>
                            <label className="text-xs uppercase tracking-wide text-slate-500">Email</label>
                            <input
                                type="email"
                                className="input mt-2"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="jane@company.com"
                            />
                        </div>

                        {/* Champ mot de passe */}
                        <div className="mt-4">
                            <label className="text-xs uppercase tracking-wide text-slate-500">Mot de passe</label>
                            <input
                                type="password"
                                className="input mt-2"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Ton mot de passe"
                            />
                        </div>

                        {/* Affichage de l'erreur si présente */}
                        {error && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Bouton de soumission avec état de chargement */}
                        <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60">
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>

                        {/* Lien vers la page d'inscription */}
                        <p className="mt-4 text-sm text-slate-500">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="font-semibold text-slate-900">
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
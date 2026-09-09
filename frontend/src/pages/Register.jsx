// pages/Register.jsx - Page d'inscription

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function Register() {
    // États pour gérer les champs du formulaire
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // États pour gérer les erreurs et le chargement
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Hook d'authentification et navigation
    const { register } = useAuth();
    const navigate = useNavigate();

    // Gestion de la soumission du formulaire d'inscription
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Réinitialisation de l'erreur et activation du loader
        setError('');
        setLoading(true);

        try {
            // Appel de la fonction d'inscription depuis le contexte
            await register({ firstname, lastname, email, password });

            // Redirection vers le dashboard après succès
            navigate('/dashboard', { replace: true });
        } catch (err) {
            const message = err?.message || "L'inscription a échoué";
            setError(message);
        } finally {
            // Désactivation du loader
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-6 py-16 text-slate-100">
            <div className="grid w-full gap-10 lg:grid-cols-2">
                {/* Colonne gauche - Titre */}
                <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/80 p-8 shadow-[0_24px_60px_-32px_rgba(0,167,255,0.38)] backdrop-blur">
                    <h1 className="text-3xl font-semibold text-white">Créez votre compte</h1>
                </div>

                {/* Colonne droite - Formulaire d'inscription */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-cyan-400/15 bg-slate-950/80 p-8 shadow-[0_24px_60px_-32px_rgba(0,167,255,0.38)] backdrop-blur"
                >
                    {/* Champs prénom et nom sur la même ligne */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-xs uppercase tracking-wide text-slate-400">Prénom</label>
                            <input
                                className="input mt-2"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                required
                                placeholder="Jane"
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wide text-slate-400">Nom</label>
                            <input
                                className="input mt-2"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                                required
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    {/* Champ email */}
                    <div className="mt-4">
                        <label className="text-xs uppercase tracking-wide text-slate-400">Email</label>
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
                        <label className="text-xs uppercase tracking-wide text-slate-400">Mot de passe</label>
                        <input
                            type="password"
                            className="input mt-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Au moins 8 caractères"
                        />
                    </div>

                    {/* Affichage de l'erreur si présente */}
                    {error && (
                        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    )}

                    {/* Bouton de soumission avec état de chargement */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Création du compte...' : 'Créer mon compte'}
                    </button>

                    {/* Lien vers la page de connexion */}
                    <p className="mt-4 text-sm text-slate-300">
                        Déjà un compte ?{' '}
                        <Link className="font-semibold text-cyan-200 hover:text-cyan-100" to="/login">
                            Se connecter
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;

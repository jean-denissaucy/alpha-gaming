// pages/Register.jsx - Page d'inscription

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, Trash2, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import usePageTitle from '../hooks/usePageTitle.js';

function Register() {
    // Titre de page dynamique (RGAA 8.6)
    usePageTitle('Créer un compte');
    // États pour gérer les champs du formulaire
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Consentement RGPD : obligatoire avant de pouvoir créer le compte.
    const [rgpdConsent, setRgpdConsent] = useState(false);

    // États pour gérer les erreurs et le chargement
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Hook d'authentification et navigation
    const { register } = useAuth();
    const navigate = useNavigate();

    // Gestion de la soumission du formulaire d'inscription
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Consentement RGPD requis avant toute création de compte.
        if (!rgpdConsent) {
            setError('Vous devez accepter la politique de protection des données pour créer votre compte.');
            return;
        }

        // Même validation que le serveur : feedback immédiat avant l'appel API.
        const trimmedEmail = email.trim();
        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            setError('Le format de l\'email est invalide.');
            return;
        }
        if (!firstname.trim() || !lastname.trim()) {
            setError('Le prénom et le nom sont requis.');
            return;
        }

        // Réinitialisation de l'erreur et activation du loader
        setError('');
        setLoading(true);

        try {
            // Appel de la fonction d'inscription depuis le contexte (champs normalisés comme côté serveur)
            await register({
                firstname: firstname.trim(),
                lastname: lastname.trim(),
                email: trimmedEmail,
                password
            });

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
                {/* Colonne gauche - Titre + information RGPD affichée AVANT la création du compte */}
                <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/80 p-8 shadow-[0_24px_60px_-32px_rgba(0,167,255,0.38)] backdrop-blur">
                    <h1 className="text-3xl font-semibold text-white">Créez votre compte</h1>

                    <p className="mt-4 text-sm leading-relaxed text-slate-300">
                        Avant de continuer, voici comment vos données personnelles sont utilisées, conformément au RGPD.
                    </p>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                            <p className="text-sm text-slate-300">
                                <strong className="text-white">Données collectées :</strong> email, prénom, nom et un mot de passe
                                (stocké uniquement sous forme hashée, illisible même par l'équipe du site).
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                            <p className="text-sm text-slate-300">
                                <strong className="text-white">Utilisation :</strong> uniquement pour gérer votre compte et vos jeux
                                favoris. Aucune donnée n'est vendue ni transmise à des tiers.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Eye className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                            <p className="text-sm text-slate-300">
                                <strong className="text-white">Vos droits :</strong> accès, rectification, portabilité et suppression
                                de votre compte et de vos favoris à tout moment.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                            <p className="text-sm text-slate-300">
                                <strong className="text-white">Conservation :</strong> vos données sont effacées lors de la suppression
                                de votre compte. Aucun cookie publicitaire n'est utilisé.
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 text-sm text-slate-400">
                        Le détail complet est sur la page{' '}
                        <Link to="/a-propos" className="font-semibold text-cyan-300 underline decoration-cyan-400/40 underline-offset-2 hover:text-cyan-200">
                            À propos — RGPD
                        </Link>.
                    </p>
                </div>

                {/* Colonne droite - Formulaire d'inscription */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-cyan-400/15 bg-slate-950/80 p-8 shadow-[0_24px_60px_-32px_rgba(0,167,255,0.38)] backdrop-blur"
                >
                    {/* Champs prénom et nom — labels associés (RGAA 11.1) + autocomplete (RGAA 11.13) */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="register-firstname" className="text-xs uppercase tracking-wide text-slate-400">Prénom</label>
                            <input
                                id="register-firstname"
                                name="firstname"
                                autoComplete="given-name"
                                className="input mt-2"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                required
                                placeholder="Jane"
                            />
                        </div>
                        <div>
                            <label htmlFor="register-lastname" className="text-xs uppercase tracking-wide text-slate-400">Nom</label>
                            <input
                                id="register-lastname"
                                name="lastname"
                                autoComplete="family-name"
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
                        <label htmlFor="register-email" className="text-xs uppercase tracking-wide text-slate-400">Email</label>
                        <input
                            id="register-email"
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
                        <label htmlFor="register-password" className="text-xs uppercase tracking-wide text-slate-400">Mot de passe</label>
                        <input
                            id="register-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            className="input mt-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Au moins 8 caractères"
                        />
                    </div>

                    {/* Consentement RGPD obligatoire avant la création du compte */}
                    <div className="mt-6 flex items-start gap-3">
                        <input
                            id="rgpd-consent"
                            type="checkbox"
                            checked={rgpdConsent}
                            onChange={(e) => setRgpdConsent(e.target.checked)}
                            required
                            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-cyan-400"
                        />
                        <label htmlFor="rgpd-consent" className="cursor-pointer text-sm leading-relaxed text-slate-300">
                            J'ai lu la politique de protection des données et j'accepte que mes informations
                            (email, prénom, nom) soient utilisées pour gérer mon compte, conformément au RGPD.{' '}
                            <Link to="/a-propos" className="font-semibold text-cyan-300 underline decoration-cyan-400/40 underline-offset-2 hover:text-cyan-200">
                                En savoir plus
                            </Link>
                        </label>
                    </div>

                    {/* Affichage de l'erreur si présente — annoncé automatiquement par les lecteurs d'écran (RGAA 11.10) */}
                    {error && (
                        <div role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
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

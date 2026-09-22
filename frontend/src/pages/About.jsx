// pages/About.jsx - Page de présentation du site : sources externes utilisées et informations RGPD.
// Page publique, accessible depuis la navigation principale (/a-propos).

import { Link } from 'react-router-dom';
import {
    Newspaper, Trophy, ClipboardCheck, Globe, Rss, ShieldCheck, Database, Lock,
    UserCheck, Trash2, Download, Mail, Server, Scale, Eye, ExternalLink, Code2, Clock
} from 'lucide-react';

// Sources RSS d'actualités utilisées par le backend (voir backend/controllers/news.controller.js).
const NEWS_SOURCES = [
    { name: 'ActuGaming.net', url: 'https://www.actugaming.net', description: 'Actualités jeux vidéo toutes plateformes.' },
    { name: 'JeuxVideo.com', url: 'https://www.jeuxvideo.com', description: 'Premier média gaming francophone.' },
    { name: 'Gamekult', url: 'https://www.gamekult.com', description: 'Tests, previews et actualité critique.' },
    { name: 'GamerGen', url: 'https://www.gamergen.com', description: 'News hardware et jeux vidéo.' },
    { name: 'Push Start', url: 'https://www.pushstart.fr', description: 'Magazine indépendant gaming et pop-culture.' }
];

// Sources RSS esport utilisées par le backend.
const ESPORT_SOURCES = [
    { name: 'HLTV', url: 'https://www.hltv.org', description: 'Référence mondiale Counter-Strike (CS2).' },
    { name: 'VLR.gg', url: 'https://www.vlr.gg', description: 'Couverture complète VALORANT.' },
    { name: 'Esports.gg', url: 'https://esports.gg', description: 'Esport toutes disciplines confondues.' },
    { name: 'Dot Esports', url: 'https://dotesports.com', description: 'Actualité esport internationale.' }
];

// Site scrappé par le backend pour alimenter les notes de jeux.
const TESTS_SOURCES = [
    { name: 'Gamekult (tests)', url: 'https://www.gamekult.com/tests.html', description: 'Catalogue de tests avec scores, plateformes et liens vers les articles complets.' }
];

// Données personnelles réellement stockées par l'application (tables users et user_favorite_games).
const DATA_ITEMS = [
    { label: 'Email', reason: 'Identification du compte et connexion.' },
    { label: 'Prénom et nom', reason: 'Personnalisation de l\'affichage (menu, dashboard).' },
    { label: 'Mot de passe', reason: 'Jamais stocké en clair : hashé avec bcrypt (algorithme de hachage dédié aux mots de passe).' },
    { label: 'Jeux favoris', reason: 'Liste de jeux enregistrée par l\'utilisateur, visible uniquement par lui.' },
    { label: 'Rôle du compte', reason: 'Distinction utilisateur / administrateur pour la sécurité.' },
    { label: 'Date de création du compte', reason: 'Suivi technique du compte.' }
];

const GDPR_RIGHTS = [
    { Icon: Eye, label: 'Droit d\'accès', description: 'Consulter les données vous concernant depuis votre profil.' },
    { Icon: UserCheck, label: 'Droit de rectification', description: 'Corriger vos informations (email, prénom, nom) à tout moment.' },
    { Icon: Trash2, label: 'Droit à l\'effacement', description: 'Demandez la suppression définitive de votre compte et de vos favoris.' },
    { Icon: Download, label: 'Droit à la portabilité', description: 'Récupérer vos données dans un format structuré sur simple demande.' }
];

const INFRA = [
    { name: 'Vercel', role: 'Hébergement du frontend (site React).' },
    { name: 'Render', role: 'Hébergement de l\'API backend (Node.js).' },
    { name: 'MySQL (Plesk)', role: 'Base de données des comptes, jeux et contenus.' }
];

function SectionCard({ children, className = '' }) {
    return (
        <div className={`rounded-3xl border border-cyan-400/15 bg-slate-950/80 p-8 shadow-[0_24px_60px_-32px_rgba(0,167,255,0.38)] backdrop-blur ${className}`}>
            {children}
        </div>
    );
}

function SourceGrid({ sources }) {
    return (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {sources.map((source) => (
                <a
                    key={source.name}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4 transition hover:border-cyan-400/50 hover:bg-slate-900"
                >
                    <Rss className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-semibold text-white">
                            {source.name}
                            <ExternalLink className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-cyan-300" />
                        </span>
                        <span className="mt-1 block text-sm text-slate-400">{source.description}</span>
                    </span>
                </a>
            ))}
        </div>
    );
}

function About() {
    return (
        <div className="mx-auto max-w-6xl px-6 py-16 text-slate-100">

            {/* En-tête de la page */}
            <header className="mb-12">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                    <Globe className="h-3.5 w-3.5" /> À propos
                </span>
                <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                    Présentation du <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">site</span>
                </h1>
                <p className="mt-4 max-w-3xl text-lg text-slate-300">
                    Alpha Gaming agrège l'actualité gaming, les notes de jeux et l'esport de médias spécialisés,
                    et vous permet de créer un compte pour sauvegarder vos jeux favoris. Cette page recense
                    l'ensemble des sites sources utilisés et détaille notre politique de protection des données (RGPD).
                </p>
            </header>

            {/* Fonctionnement de l'agrégation */}
            <SectionCard className="mb-8">
                <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
                    <Code2 className="h-6 w-6 text-cyan-300" /> Comment le contenu est-il récupéré ?
                </h2>
                <p className="mt-4 leading-relaxed text-slate-300">
                    Alpha Gaming ne produit pas d'articles propres : le site agrège automatiquement des <strong className="text-white">flux RSS publics</strong>
                    {' '}fournis par les médias partenaires et consulte la <strong className="text-white">page publique des tests</strong> de Gamekult.
                    La synchronisation s'effectue chaque nuit à 04h00, et chaque contenu renvoie toujours vers l'article original sur le site source.
                    Aucun contenu n'est réhébergé : titres, extraits courts et images servent uniquement à présenter le lien vers la source.
                </p>
            </SectionCard>

            {/* Sources : actualités */}
            <SectionCard className="mb-8">
                <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
                    <Newspaper className="h-6 w-6 text-cyan-300" /> Sources d'actualités
                </h2>
                <SourceGrid sources={NEWS_SOURCES} />
            </SectionCard>

            {/* Sources : esport */}
            <SectionCard className="mb-8">
                <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
                    <Trophy className="h-6 w-6 text-cyan-300" /> Sources esport
                </h2>
                <SourceGrid sources={ESPORT_SOURCES} />
            </SectionCard>

            {/* Sources : tests / notes de jeux */}
            <SectionCard className="mb-8">
                <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
                    <ClipboardCheck className="h-6 w-6 text-cyan-300" /> Sources des tests et notes de jeux
                </h2>
                <SourceGrid sources={TESTS_SOURCES} />
                <p className="mt-4 text-sm text-slate-400">
                    Les scores affichés proviennent des tests publiés publiquement par Gamekult ; la note complète et le verdict
                    se lisent sur le site source en cliquant sur le test.
                </p>
            </SectionCard>

            {/* Hébergement et infrastructure */}
            <SectionCard className="mb-8">
                <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
                    <Server className="h-6 w-6 text-cyan-300" /> Hébergement et technique
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {INFRA.map((item) => (
                        <div key={item.name} className="rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4">
                            <strong className="block text-white">{item.name}</strong>
                            <span className="mt-1 block text-sm text-slate-400">{item.role}</span>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-sm text-slate-400">
                    Stack : React 19 (Vite), Node.js / Express 5, MySQL 8, authentification par JWT avec mots de passe hashés (bcrypt).
                </p>
            </SectionCard>

            {/* ======================= RGPD ======================= */}
            <header className="mb-8 mt-14">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" /> RGPD
                </span>
                <h2 className="mt-4 text-3xl font-semibold text-white">Protection de vos données personnelles</h2>
                <p className="mt-3 max-w-3xl text-slate-300">
                    Conformément au Règlement Général sur la Protection des Données (UE 2016/679), voici en toute transparence
                    quelles données sont collectées, pourquoi, et quels sont vos droits.
                </p>
            </header>

            {/* Données collectées */}
            <SectionCard className="mb-8">
                <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
                    <Database className="h-5 w-5 text-emerald-300" /> Données collectées
                </h3>
                <div className="mt-5 divide-y divide-slate-800">
                    {DATA_ITEMS.map((item) => (
                        <div key={item.label} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                            <strong className="w-48 shrink-0 text-white">{item.label}</strong>
                            <span className="text-sm text-slate-400">{item.reason}</span>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Finalités et conservation */}
            <div className="mb-8 grid gap-8 lg:grid-cols-2">
                <SectionCard>
                    <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
                        <Scale className="h-5 w-5 text-emerald-300" /> Finalités et base légale
                    </h3>
                    <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                        <li><strong className="text-white">Gestion du compte</strong> (inscription, connexion, favoris) — base légale : l'exécution du contrat que vous acceptez en créant votre compte.</li>
                        <li><strong className="text-white">Sécurité du service</strong> (protection contre les abus) — base légale : notre intérêt légitime.</li>
                        <li><strong className="text-white">Administration du site</strong> — réservée aux comptes administrateurs.</li>
                    </ul>
                </SectionCard>
                <SectionCard>
                    <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
                        <Clock className="h-5 w-5 text-emerald-300" /> Conservation et sécurité
                    </h3>
                    <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                        <li>Vos données sont conservées <strong className="text-white">tant que votre compte existe</strong>. La suppression du compte entraîne l'effacement de vos favoris (suppression en cascade en base).</li>
                        <li>Les mots de passe sont <strong className="text-white">irréversiblement hashés</strong> (bcrypt) : même l'équipe du site ne peut pas les lire.</li>
                        <li>Aucune donnée n'est <strong className="text-white">vendue, louée ou transmise</strong> à des tiers à des fins commerciales.</li>
                        <li>Aucun cookie publicitaire ni traceur : seul un <strong className="text-white">jeton de session technique</strong> est conservé dans votre navigateur pour maintenir votre connexion.</li>
                    </ul>
                </SectionCard>
            </div>

            {/* Droits des utilisateurs */}
            <SectionCard className="mb-8">
                <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
                    <Lock className="h-5 w-5 text-emerald-300" /> Vos droits
                </h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {GDPR_RIGHTS.map(({ Icon, label, description }) => (
                        <div key={label} className="flex items-start gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4">
                            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                            <span>
                                <strong className="block text-white">{label}</strong>
                                <span className="mt-1 block text-sm text-slate-400">{description}</span>
                            </span>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-sm text-slate-400">
                    Pour exercer vos droits, contactez l'administrateur du site via l'adresse de contact indiquée sur la page
                    du projet. Vous pouvez également introduire une réclamation auprès de la{' '}
                    <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="font-semibold text-cyan-300 underline decoration-cyan-400/40 underline-offset-2 hover:text-cyan-200">
                        CNIL <ExternalLink className="inline h-3 w-3" />
                    </a>.
                </p>
            </SectionCard>

            {/* Contenu tiers */}
            <SectionCard>
                <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
                    <Globe className="h-5 w-5 text-emerald-300" /> Contenu de tiers et liens sortants
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                    Les articles, images et tests affichés appartiennent à leurs auteurs et médias respectifs. Les liens « Lire l'article »
                    ouvrent le site source dans un nouvel onglet : ces sites appliquent leurs propres politiques de confidentialité
                    (cookies publicitaires, mesures d'audience), que nous vous invitons à consulter sur leurs pages dédiées.
                </p>
                <p className="mt-4 text-sm text-slate-400">
                    Dernière mise à jour de cette page : septembre 2026.{' '}
                    <Link to="/" className="font-semibold text-cyan-300 hover:text-cyan-200">Retour à l'accueil</Link>
                </p>
            </SectionCard>
        </div>
    );
}

export default About;

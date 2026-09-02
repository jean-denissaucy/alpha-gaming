// pages/Home.jsx - Page d'accueil publique

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import BrandLogo from '../components/BrandLogo.jsx';
import { newsService, esportService } from '../services/api.js';

const fallbackNews = [
    {
        title: 'Silksong refait surface: 18 minutes de gameplay diffusées',
        category: 'Indé',
        readingTime: '6 min',
        excerpt: 'Team Cherry montre enfin un build solide avec de nouveaux biomes, des boss plus agressifs et un système de crafting repensé.',
        source: 'Alpha Gaming',
        url: null
    },
    {
        title: 'GTA VI: Rockstar confirme une bande-annonce orientée mode online',
        category: 'AAA',
        readingTime: '4 min',
        excerpt: 'Le studio tease des activités de crew en monde ouvert et une économie dynamique plus ambitieuse que sur GTA Online.',
        source: 'Alpha Gaming',
        url: null
    },
    {
        title: 'Le prochain Zelda miserait sur un monde maritime semi-procédural',
        category: 'Nintendo',
        readingTime: '5 min',
        excerpt: 'Selon plusieurs insiders, Nintendo expérimenterait une navigation plus libre et des îles évolutives à chaque session.',
        source: 'Alpha Gaming',
        url: null
    }
];

const fallbackEsportMatches = [
    { league: 'League européenne de LoL', match: 'Karmine Corp vs G2', time: '19:00', href: 'https://lolesports.com/', external: true },
    { league: 'Tour des champions VALORANT', match: 'Fnatic vs Heretics', time: '21:30', href: 'https://valorantesports.com/', external: true },
    { league: 'Majeur Rocket League', match: 'Vitality vs BDS', time: '23:00', href: 'https://esports.rocketleague.com/', external: true },
    { league: 'Majeur CS2', match: 'NAVI vs FaZe', time: '20:00', href: 'https://www.hltv.org/', external: true },
    { league: 'Ligue Call of Duty', match: 'OpTic Texas vs Toronto Ultra', time: '22:00', href: 'https://callofdutyleague.com/', external: true },
    { league: 'Série des champions Overwatch', match: 'Team Falcons vs Crazy Raccoon', time: '18:30', href: 'https://esports.overwatch.com/', external: true },
    { league: 'Série mondiale Apex Legends', match: 'TSM vs Alliance', time: '20:45', href: 'https://www.ea.com/games/apex-legends/compete', external: true },
    { league: 'Championnat mondial PUBG', match: 'Gen.G vs Soniqs', time: '21:15', href: 'https://pubgesports.com/', external: true },
    { league: 'Esport Rainbow Six', match: 'BDS vs W7M', time: '19:45', href: 'https://www.ubisoft.com/esports/rainbow-six/siege', external: true },
    { league: 'Circuit pro Dota 2', match: 'Team Spirit vs Gaimin Gladiators', time: '23:30', href: 'https://www.dota2.com/esports', external: true }
];

const esportLeagueLabels = {
    'League of Legends': 'League européenne de LoL',
    'VALORANT': 'Tour des champions VALORANT',
    'Rocket League': 'Majeur Rocket League',
    'CS2': 'Majeur CS2',
    'Call of Duty': 'Ligue Call of Duty',
    'Overwatch': 'Série des champions Overwatch',
    'Apex Legends': 'Série mondiale Apex Legends',
    'PUBG': 'Championnat mondial PUBG',
    'Rainbow Six': 'Esport Rainbow Six',
    'Dota 2': 'Circuit pro Dota 2',
    'Esport': 'Esport'
};

function formatEsportLeagueLabel(league = '') {
    return esportLeagueLabels[league] || league;
}

function Home() {
    // Vérification si l'utilisateur est connecté pour adapter les CTA
    const { isAuthenticated } = useAuth();
    const [featuredNews, setFeaturedNews] = useState(fallbackNews);
    const [lastNewsUpdate, setLastNewsUpdate] = useState(null);
    const [liveEsportMatches, setLiveEsportMatches] = useState(fallbackEsportMatches);
    const [lastEsportUpdate, setLastEsportUpdate] = useState(null);


    useEffect(() => {
        let isMounted = true;
        let midnightTimeoutId;
        let midnightIntervalId;

        const loadNews = async () => {
            try {
                const data = await newsService.getLatest(9);
                if (!isMounted) return;

                const items = Array.isArray(data?.data?.items)
                    ? data.data.items
                    : Array.isArray(data?.items)
                        ? data.items
                        : [];
                if (items.length > 0) {
                    setFeaturedNews(items);
                    setLastNewsUpdate(new Date());
                }
            } catch {
                if (!isMounted) return;
                setFeaturedNews(fallbackNews);
            }
        };

        const scheduleMondayRefresh = () => {
            const now = new Date();
            const nextMonday = new Date(now);
            const day = now.getDay();
            const daysUntilMonday = ((8 - day) % 7) || 7;

            nextMonday.setDate(now.getDate() + daysUntilMonday);
            nextMonday.setHours(0, 0, 0, 0);

            const msUntilNextMonday = nextMonday.getTime() - now.getTime();

            midnightTimeoutId = setTimeout(async () => {
                await loadNews();
                midnightIntervalId = setInterval(loadNews, 7 * 24 * 60 * 60 * 1000);
            }, msUntilNextMonday);
        };

        loadNews();
        scheduleMondayRefresh();

        return () => {
            isMounted = false;
            clearTimeout(midnightTimeoutId);
            clearInterval(midnightIntervalId);
        };
    }, []);

    useEffect(() => {
        let midnightTimeoutId;
        let midnightIntervalId;

        const loadEsport = async () => {
            try {
                const data = await esportService.getLatest(10);
                const items = Array.isArray(data?.data?.items)
                    ? data.data.items
                    : Array.isArray(data?.items)
                        ? data.items
                        : [];

                if (items.length > 0) {
                    setLiveEsportMatches(items);
                    setLastEsportUpdate(new Date());
                    return;
                }

                setLiveEsportMatches(fallbackEsportMatches);
            } catch {
                setLiveEsportMatches(fallbackEsportMatches);
            }
        };

        const scheduleMondayRefresh = () => {
            const now = new Date();
            const nextMonday = new Date(now);
            const day = now.getDay();
            const daysUntilMonday = ((8 - day) % 7) || 7;

            nextMonday.setDate(now.getDate() + daysUntilMonday);
            nextMonday.setHours(0, 0, 0, 0);

            const msUntilNextMonday = nextMonday.getTime() - now.getTime();

            midnightTimeoutId = setTimeout(async () => {
                await loadEsport();
                midnightIntervalId = setInterval(loadEsport, 7 * 24 * 60 * 60 * 1000);
            }, msUntilNextMonday);
        };

        loadEsport();
        scheduleMondayRefresh();

        return () => {
            clearTimeout(midnightTimeoutId);
            clearInterval(midnightIntervalId);
        };
    }, []);

    return (
        <div className="relative pb-16">
            <section className="mx-auto max-w-6xl px-6 pt-6">
                <div className="mega-banner relative overflow-hidden rounded-4xl border border-cyan-400/20 bg-black/90 shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.28),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.24),transparent_24%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,15,35,0.96))]" />
                    <div className="pointer-events-none absolute inset-0 banner-grid opacity-55" />
                    <div className="pointer-events-none absolute -left-12 top-8 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
                    <div className="pointer-events-none absolute -right-4 bottom-6 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />

                    <div className="relative grid gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:items-center md:px-10 md:py-14">
                        <div className="reveal-up">
                            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                                Toute l’actualité gaming en continu
                            </p>
                            <h1 className="mt-5 text-4xl font-black uppercase leading-[0.95] text-white sm:text-6xl">
                                Alpha
                                <span className="block text-cyan-300">Gaming</span>
                            </h1>
                            <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
                                Tests, articles, sorties, esports et coups de coeur de la semaine. Une vitrine néon pensée comme un vrai hub média.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-4">
                                <a className="btn btn-primary" href="#top-news">Explorer les articles</a>
                                {isAuthenticated ? (
                                    <Link className="btn btn-outline" to="/dashboard">
                                        Mon espace
                                    </Link>
                                ) : (
                                    <>
                                        <Link className="btn btn-outline" to="/login">
                                            Se connecter
                                        </Link>
                                        <Link className="btn btn-outline" to="/register">
                                            Créer un compte
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-md md:justify-self-end">
                            <div className="absolute -inset-4 rounded-4xl bg-blue-500/10 blur-2xl" />
                            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl">
                                <div className="absolute inset-0 opacity-30 banner-scan" />
                                <div className="relative space-y-5">
                                    <div className="mx-auto max-w-90">
                                        <BrandLogo variant="full" className="w-full drop-shadow-[0_0_36px_rgba(34,211,238,0.3)]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Temps fort du jour</p>
                                        <p className="mt-2 text-2xl font-black uppercase text-white">Nouveau cycle Xbox, PC, PS5 et Nintendo</p>
                                        <p className="mt-2 text-sm text-slate-300">Gameplay, analyse et actu chaude dans un seul flux visuel.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="hero-glow relative overflow-hidden">
                <div className="pointer-events-none absolute -left-12 top-12 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-10 bottom-0 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />

            </section>

            <section id="top-news" className="mx-auto mt-6 max-w-6xl px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">Articles à la une</h2>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                        {lastNewsUpdate
                            ? `Maj ${lastNewsUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Edition du jour'}
                    </span>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                    {featuredNews.slice(0, 3).map((news, index) => (
                        <article
                            key={`${news.title}-${index}`}
                            className="news-card reveal-up rounded-3xl border border-slate-700/70 bg-slate-900/75 p-6"
                            style={{ animationDelay: `${index * 120}ms` }}
                        >
                            {news.url ? (
                                <a href={news.url} target="_blank" rel="noreferrer" className="block">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                                        {news.category} • {news.readingTime}
                                    </p>
                                    {news.image && <img className="news-card-image" src={news.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
                                    <h3 className="mt-3 text-xl font-bold text-white">{news.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{news.excerpt}</p>
                                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">Source : {news.source || 'Alpha Gaming'}</p>
                                </a>
                            ) : (
                                <>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                                        {news.category} • {news.readingTime}
                                    </p>
                                    {news.image && <img className="news-card-image" src={news.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
                                    <h3 className="mt-3 text-xl font-bold text-white">{news.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{news.excerpt}</p>
                                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">Source : {news.source || 'Alpha Gaming'}</p>
                                </>
                            )}
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto mt-8 max-w-6xl px-6">
                <div className="grid gap-6 lg:grid-cols-5">
                    <div className="rounded-3xl border border-slate-700/70 bg-slate-900/75 p-6 lg:col-span-3">
                        <div>
                            <h2 className="text-2xl font-bold uppercase tracking-wide text-white">Actualités</h2>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">Les dernières informations gaming</p>
                        </div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {featuredNews.length === 0 ? (
                                <p className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300">Aucune actualité disponible pour le moment.</p>
                            ) : featuredNews.map((review) => {
                                const content = (
                                    <>
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <h3 className="font-semibold text-white">{review.title}</h3>
                                            <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-200">{review.category}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-300">{review.excerpt}</p>
                                        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-slate-500">Source : {review.source || 'Alpha Gaming'}</p>
                                    </>
                                );

                                return review.href ? (
                                    <a
                                        key={review.game}
                                        href={review.href}
                                        target={review.external ? '_blank' : undefined}
                                        rel={review.external ? 'noreferrer' : undefined}
                                        className="block rounded-2xl border border-slate-700 bg-slate-950/70 p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:bg-slate-900/90"
                                    >
                                        {content}
                                    </a>
                                ) : (
                                    <div key={review.game} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div id="esport" className="rounded-3xl border border-slate-700/70 bg-slate-900/75 p-6 lg:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-2xl font-bold uppercase tracking-wide text-white">Compétitions en direct</h2>
                            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">
                                {lastEsportUpdate
                                    ? `Maj ${lastEsportUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                                    : 'Edition du jour'}
                            </span>
                        </div>
                        <ul className="mt-5 space-y-3">
                            {liveEsportMatches.slice(0, 3).map((item) => {
                                const content = (
                                    <>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">{formatEsportLeagueLabel(item.league)}</p>
                                        <p className="mt-2 font-semibold text-white">{item.match}</p>
                                        <p className="mt-2 text-sm text-slate-300">Coup d'envoi: {item.time}</p>
                                    </>
                                );

                                return item.href ? (
                                    <li key={item.match}>
                                        <a
                                            href={item.href}
                                            target={item.external ? '_blank' : undefined}
                                            rel={item.external ? 'noreferrer' : undefined}
                                            className="block rounded-2xl border border-slate-700 bg-slate-950/70 p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:bg-slate-900/90"
                                        >
                                            {content}
                                        </a>
                                    </li>
                                ) : (
                                    <li key={item.match} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                                        {content}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;

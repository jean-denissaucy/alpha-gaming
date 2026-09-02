// pages/Home.jsx - Page d'accueil publique

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Monitor, Gamepad2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import BrandLogo from '../components/BrandLogo.jsx';
import { newsService, esportService, testsService } from '../services/api.js';

function homeScoreColor(score) {
    const value = Number.parseInt(score, 10);
    if (value >= 8) return 'from-emerald-400 to-teal-500';
    if (value >= 6) return 'from-cyan-400 to-blue-500';
    if (value >= 4) return 'from-amber-400 to-orange-500';
    return 'from-rose-500 to-red-600';
}

function Home() {
    // Vérification si l'utilisateur est connecté pour adapter les CTA
    const { isAuthenticated } = useAuth();
    const [featuredNews, setFeaturedNews] = useState([]);
    const [lastNewsUpdate, setLastNewsUpdate] = useState(null);
    const [liveEsportMatches, setLiveEsportMatches] = useState([]);
    const [lastEsportUpdate, setLastEsportUpdate] = useState(null);
    const [tests, setTests] = useState([]);


    useEffect(() => {
        let isMounted = true;
        let midnightTimeoutId;
        let midnightIntervalId;

        const loadNews = async () => {
            try {
                const data = await newsService.getLatest(50);
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
                setFeaturedNews([]);
            }
        };

        const scheduleDailyRefresh = () => {
            const now = new Date();
            const nextMonday = new Date(now);
            nextMonday.setDate(now.getDate() + 1);
            nextMonday.setHours(0, 0, 0, 0);

            const msUntilNextMonday = nextMonday.getTime() - now.getTime();

            midnightTimeoutId = setTimeout(async () => {
                await loadNews();
                midnightIntervalId = setInterval(loadNews, 24 * 60 * 60 * 1000);
            }, msUntilNextMonday);
        };

        loadNews();
        scheduleDailyRefresh();

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

                setLiveEsportMatches([]);
            } catch {
                setLiveEsportMatches([]);
            }
        };

        const scheduleDailyRefresh = () => {
            const now = new Date();
            const nextMonday = new Date(now);
            nextMonday.setDate(now.getDate() + 1);
            nextMonday.setHours(0, 0, 0, 0);

            const msUntilNextMonday = nextMonday.getTime() - now.getTime();

            midnightTimeoutId = setTimeout(async () => {
                await loadEsport();
                midnightIntervalId = setInterval(loadEsport, 24 * 60 * 60 * 1000);
            }, msUntilNextMonday);
        };

        loadEsport();
        scheduleDailyRefresh();

        return () => {
            clearTimeout(midnightTimeoutId);
            clearInterval(midnightIntervalId);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadTests = async () => {
            try {
                const data = await testsService.getLatest(10);
                if (!isMounted) return;
                const items = Array.isArray(data?.data?.items)
                    ? data.data.items
                    : Array.isArray(data?.items)
                        ? data.items
                        : [];
                if (items.length > 0) setTests(items);
            } catch {
                if (!isMounted) return;
                setTests([]);
            }
        };

        loadTests();

        return () => { isMounted = false; };
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
                    <h2 className="text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">Actualités</h2>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                        {lastNewsUpdate
                            ? `Maj ${lastNewsUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Edition du jour'}
                    </span>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {featuredNews.slice(0, 3).map((news, index) => {
                        const cardContent = (
                            <>
                                <div className="relative">
                                    {news.image ? <img className="aspect-[16/9] w-full rounded-xl object-cover" src={news.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-slate-800 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">ACTU</div>}
                                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200 backdrop-blur">{news.category || 'Actu'}</span>
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">{news.readingTime || 'Lecture'}</p>
                                    <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-white">{news.title}</h3>
                                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{news.excerpt}</p>
                                    <p className="mt-auto pt-4 text-xs uppercase tracking-[0.16em] text-slate-500">Source : {news.source || 'Alpha Gaming'}</p>
                                </div>
                            </>
                        );

                        return (
                            <article
                                key={`${news.title}-${index}`}
                                className="group reveal-up flex flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/70 transition hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-400/5"
                                style={{ animationDelay: `${index * 120}ms` }}
                            >
                                {news.url ? (
                                    <a href={news.url} target="_blank" rel="noreferrer" className="flex flex-1 flex-col">{cardContent}</a>
                                ) : cardContent}
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="mx-auto mt-8 max-w-6xl px-6">
                <div className="grid gap-6 lg:grid-cols-5">
                    <div className="rounded-3xl border border-slate-700/70 bg-slate-900/75 p-6 lg:col-span-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold uppercase tracking-wide text-white">Derniers tests</h2>
                                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">Notes de la rédaction Gamekult</p>
                            </div>
                            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">Gamekult</span>
                        </div>
                        <div className="mt-5 space-y-3">
                            {tests.length === 0 ? (
                                <p className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300">Aucun test disponible pour le moment.</p>
                            ) : tests.slice(0, 10).map((review) => (
                                <a
                                    key={review.href || review.title}
                                    href={review.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-center gap-4 rounded-2xl border border-slate-700/70 bg-slate-950/60 p-3 transition hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-slate-900/80"
                                >
                                    {review.image ? <img className="h-20 w-32 shrink-0 rounded-xl object-cover" src={review.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl bg-slate-800"><Gamepad2 className="h-6 w-6 text-slate-500" /></div>}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-semibold leading-snug text-white transition group-hover:text-cyan-200">{review.title}</h3>
                                            <span className={`inline-flex shrink-0 items-center gap-1 rounded-xl bg-gradient-to-br ${homeScoreColor(review.score)} px-2.5 py-1 text-sm font-black text-white shadow-lg`}>
                                                <Star className="h-3.5 w-3.5 fill-current" /> {review.score}/10
                                            </span>
                                        </div>
                                        <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-400"><Monitor className="h-3.5 w-3.5" /> {review.platform || 'Multi'}</p>
                                    </div>
                                </a>
                            ))}
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
                            {liveEsportMatches.slice(0, 7).map((item) => {
                                const content = (
                                    <>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">{item.league || 'Compétition'}</p>
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
                                            className="home-news-carousel-card block rounded-2xl border border-slate-700 bg-slate-950/70 p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:bg-slate-900/90"
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

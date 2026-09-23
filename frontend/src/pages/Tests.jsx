import { useEffect, useMemo, useState } from 'react';
import usePageTitle from '../hooks/usePageTitle.js';
import { Star, Monitor, ExternalLink, Gamepad2, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { testsService } from '../services/api.js';

const PAGE_SIZE = 25;

function scoreBadge(score) {
    const value = Number.parseInt(score, 10);
    if (value >= 8) return { bg: 'bg-emerald-600', text: 'text-white' };
    if (value >= 6) return { bg: 'bg-cyan-700', text: 'text-white' };
    if (value >= 4) return { bg: 'bg-amber-600', text: 'text-slate-900' };
    return { bg: 'bg-rose-700', text: 'text-white' };
}

export default function Tests() {
    // Titre de page dynamique (RGAA 8.6)
    usePageTitle('Tests de jeux');
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [platform, setPlatform] = useState('Toutes');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imageErrors, setImageErrors] = useState(new Set());

    useEffect(() => {
        let isMounted = true;
        setError('');

        const load = async () => {
            setLoading(true);
            try {
                const data = await testsService.getPage(page, PAGE_SIZE);
                if (!isMounted) return;
                const next = data?.data?.items || data?.items || [];
                setItems(next);
                setTotalPages(data?.data?.totalPages || 1);
                setTotal(data?.data?.total || next.length);
            } catch (err) {
                if (!isMounted) return;
                setError(err?.message || 'Impossible de charger les tests.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();
        return () => { isMounted = false; };
    }, [page]);

    const platforms = useMemo(() => ['Toutes', ...new Set(items.map((item) => item.platform).filter(Boolean))], [items]);
    const visible = platform === 'Toutes' ? items : items.filter((item) => item.platform === platform);

    const goTo = (nextPage) => {
        const safe = Math.max(1, Math.min(nextPage, totalPages));
        setPage(safe);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <section className="news-hero">
                <span className="esport-eyebrow"><i /> ALPHA GAMING TESTS</span>
                <h1>Les tests <span>de la rédaction.</span></h1>
                <p>Toutes les notes attribuées par la rédaction Gamekult.</p>
            </section>

            <div className="news-filters news-filters-center my-6">
                {platforms.map((entry) => (
                    <button className={platform === entry ? 'active' : ''} onClick={() => setPlatform(entry)} key={entry}>{entry}</button>
                ))}
            </div>

            <p className="mb-4 text-sm text-slate-400">{total} tests · {totalPages} pages</p>

            {loading ? (
                <p className="news-loading" role="status">Chargement des tests…</p>
            ) : error ? (
                <p className="text-rose-300">{error}</p>
            ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                    {visible.map((item) => {
                        const badge = scoreBadge(item.score);
                        const card = (
                            <>
                                <div className="group relative aspect-[2/3] overflow-hidden">
                                    {item.image && !imageErrors.has(item.id) ? (
                                        <img className="h-full w-full rounded-t-2xl object-cover transition duration-300 group-hover:scale-105" src={item.image} alt={item.title} loading="lazy" onError={() => setImageErrors((current) => new Set(current).add(item.id))} />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center rounded-t-2xl bg-slate-800">
                                            <Gamepad2 className="h-10 w-10 text-slate-500" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200 backdrop-blur">
                                        <Monitor className="h-3.5 w-3.5" />
                                        {item.platform || 'Multi'}
                                    </span>
                                    <span className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-black shadow-lg ${badge.bg} ${badge.text}`}>
                                        <Star className="h-4 w-4 fill-current" />
                                        {item.score}/10
                                    </span>
                                </div>
                                <div className="p-4">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">{item.platform || 'Test'}</p>
                                    <h2 className="mt-2 text-base font-bold text-white">{item.title}</h2>
                                </div>
                            </>
                        );

                        return item.href ? (
                            <a key={item.href || item.title} href={item.href} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/75 transition hover:-translate-y-1 hover:border-cyan-400/60">
                                {card}
                                <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    <span>Ouvrir</span>
                                    <ExternalLink className="h-3.5 w-3.5 text-cyan-300" />
                                </div>
                            </a>
                        ) : (
                            <article key={item.href || item.title} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/75">
                                {card}
                            </article>
                        );
                    })}
                </div>
            )}

            {visible.length === 0 && !loading && !error && <p className="mt-6 text-slate-300">Aucun test dans cette sélection.</p>}

            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button className="btn btn-outline" disabled={page === 1} onClick={() => goTo(page - 1)}>
                        <ArrowLeft className="h-4 w-4" /> Précédente
                    </button>
                    <span className="text-sm text-slate-300">Page {page} sur {totalPages}</span>
                    <button className="btn btn-outline" disabled={page === totalPages} onClick={() => goTo(page + 1)}>
                        Suivante <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </main>
    );
}

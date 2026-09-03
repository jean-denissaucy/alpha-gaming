import { useEffect, useMemo, useState } from 'react';
import { Star, Monitor, Clock, ExternalLink, Gamepad2, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { testsService } from '../services/api.js';

const PAGE_SIZE = 20;

function scoreColor(score) {
    const value = Number.parseInt(score, 10);
    if (value >= 8) return { bg: 'from-emerald-400 to-teal-500', text: 'text-white' };
    if (value >= 6) return { bg: 'from-cyan-400 to-blue-500', text: 'text-white' };
    if (value >= 4) return { bg: 'from-amber-400 to-orange-500', text: 'text-slate-900' };
    return { bg: 'from-rose-500 to-red-600', text: 'text-white' };
}

export default function Tests() {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [platform, setPlatform] = useState('Toutes');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                <p>Toutes les notes attribuées par la rédaction Gamekult, avec la plateforme et la jaquette de chaque jeu testé.</p>
            </section>

            <div className="news-filters my-6">
                {platforms.map((entry) => (
                    <button className={platform === entry ? 'active' : ''} onClick={() => setPlatform(entry)} key={entry}>{entry}</button>
                ))}
            </div>

            <p className="mb-4 text-sm text-slate-400">{total} tests · {totalPages} pages</p>

            {loading ? (
                <p className="news-loading">Chargement des tests…</p>
            ) : error ? (
                <p className="news-loading">{error}</p>
            ) : visible.length === 0 ? (
                <p className="news-loading">Aucun test disponible pour le moment.</p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((item, index) => {
                        const color = scoreColor(item.score);
                        return (
                            <article
                                key={item.href || item.title || index}
                                className="group relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/70 transition hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-400/5"
                            >
                                <a href={item.href} target="_blank" rel="noreferrer" className="block">
                                    <div className="relative aspect-[2/3] overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-800"><Gamepad2 className="h-10 w-10 text-slate-500" /></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                                        <span className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-xl bg-gradient-to-br ${color.bg} ${color.text} px-3 py-1.5 font-black shadow-lg`}>
                                            <Star className="h-4 w-4 fill-current" />
                                            {item.score}/10
                                        </span>
                                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200 backdrop-blur">
                                            <Monitor className="h-3.5 w-3.5" />
                                            {item.platform || 'Multi'}
                                        </span>
                                    </div>

                                    <div className="p-5">
                                        {item.inCatalog && (
                                            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                                                <Sparkles className="h-3.5 w-3.5" /> Dans votre catalogue
                                            </span>
                                        )}
                                        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white transition group-hover:text-cyan-200">{item.title}</h3>
                                        <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-wider text-slate-500">
                                            <span className="inline-flex items-center gap-1.5">{item.source || 'Gamekult'}</span>
                                            <span className="inline-flex items-center gap-1.5 text-cyan-300"><Clock className="h-3.5 w-3.5" /> Lire le test <ExternalLink className="h-3.5 w-3.5" /></span>
                                        </div>
                                    </div>
                                </a>
                            </article>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <button className="btn btn-outline inline-flex items-center gap-2" disabled={page === 1} onClick={() => goTo(page - 1)}>
                        <ArrowLeft className="h-4 w-4" /> Précédente
                    </button>
                    <span className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
                        Page <span className="font-bold text-cyan-300">{page}</span> sur {totalPages}
                    </span>
                    <button className="btn btn-outline inline-flex items-center gap-2" disabled={page === totalPages} onClick={() => goTo(page + 1)}>
                        Suivante <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </main>
    );
}

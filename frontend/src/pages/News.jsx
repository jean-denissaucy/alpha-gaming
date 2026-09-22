import { useEffect, useMemo, useState } from 'react';
import usePageTitle from '../hooks/usePageTitle.js';
import { newsService } from '../services/api.js';



export default function News() {
    // Titre de page dynamique (RGAA 8.6)
    usePageTitle('Actualités');
    const [items, setItems] = useState([]);
    const [category, setCategory] = useState('Toutes');
    const [loading, setLoading] = useState(true);
    useEffect(() => { newsService.getLatest(50).then((data) => { const next = data?.data?.items || data?.items || []; if (next.length) setItems(next); }).catch(() => {}).finally(() => setLoading(false)); }, []);
    const categories = useMemo(() => ['Toutes', ...new Set(items.map((item) => item.category).filter(Boolean))], [items]);
    const visible = category === 'Toutes' ? items : items.filter((item) => item.category === category);
    return <main className="news-page"><section className="news-hero"><span className="esport-eyebrow"><i/> ALPHA GAMING NEWSROOM</span><h1>L’actualité <span>gaming.</span></h1><p>Les informations essentielles du jeu vidéo, sélectionnées et actualisées depuis nos sources spécialisées.</p></section><section className="news-section"><div className="news-section-head"><div><span className="admin-label">FLUX EN DIRECT</span><h2>Dernières actualités</h2></div><div className="news-filters">{categories.map((entry) => <button className={category === entry ? 'active' : ''} onClick={() => setCategory(entry)} key={entry}>{entry}</button>)}</div></div>{loading ? <p className="news-loading">Chargement des actualités…</p> : <div className="news-grid">{visible.map((item, index) => <a className="news-page-card" href={item.url || undefined} target={item.url ? '_blank' : undefined} rel={item.url ? 'noreferrer' : undefined} key={`${item.title}-${index}`}>{item.image ? <img src={item.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="news-placeholder">AG</div>}<div className="news-page-card-body"><div className="news-meta"><span>{item.category || 'Gaming'}</span><span>{item.readingTime || '3 min'}</span></div><h3>{item.title}</h3><p>{item.excerpt}</p><small>{item.source || 'Alpha Gaming'} · Lire l’article ↗</small></div></a>)}</div>}</section></main>;
}

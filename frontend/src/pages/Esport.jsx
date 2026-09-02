import { useEffect, useMemo, useState } from 'react';
import { esportService } from '../services/api.js';



export default function Esport() {
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('Toutes');
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    useEffect(() => { esportService.getLatest(20).then((data) => { const items = data?.data?.items || data?.items || []; if (items.length) setEvents(items); setLastUpdate(new Date()); }).catch(() => {}).finally(() => setLoading(false)); }, []);
    const leagues = useMemo(() => ['Toutes', ...new Set(events.map((event) => event.league).filter(Boolean))], [events]);
    const visible = filter === 'Toutes' ? events : events.filter((event) => event.league === filter);
    return <main className="esport-page"><section className="esport-hero"><div className="esport-hero-grid"/><div className="esport-hero-content"><span className="esport-eyebrow"><i/> LIVE COMPETITION HUB</span><h1>Esport <span>ARENA</span></h1><p>Le calendrier compétitif d’Alpha Gaming : matchs, ligues et affrontements à suivre en direct.</p><div className="esport-hero-meta"><span>◉ {events.length} compétitions suivies</span><span>◷ Mise à jour {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'en cours'}</span></div></div><div className="esport-orb">VS</div></section><section className="esport-section"><div className="esport-section-head"><div><span className="admin-label">PROGRAMME DU JOUR</span><h2>Toutes les compétitions</h2></div><div className="esport-filters">{leagues.slice(0, 6).map((league) => <button className={filter === league ? 'active' : ''} key={league} onClick={() => setFilter(league)}>{league === 'Toutes' ? 'Toutes' : league.replace(/^(Majeur|Tour des champions|Ligue|Série des champions|Série mondiale|Championnat mondial|Circuit pro|Esport|League européenne de) ?/, '').slice(0, 16)}</button>)}</div></div>{loading ? <div className="esport-loading">Synchronisation des compétitions…</div> : <div className="esport-grid">{visible.map((event, index) => <a className="esport-card" href={event.href} target="_blank" rel="noreferrer" key={`${event.match}-${index}`}><div className="esport-card-top"><span className="esport-game-icon">{['◈','✦','◉','◆'][index % 4]}</span><span className="esport-live">LIVE / À VENIR</span></div><span className="esport-league">{event.league}</span><h3>{event.match}</h3><div className="esport-card-footer"><span>◷ {event.time || 'Heure à confirmer'}</span><span>{event.source || 'Circuit officiel'} ↗</span></div></a>)}</div>}</section></main>;
}

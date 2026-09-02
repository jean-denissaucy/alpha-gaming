import { useEffect, useMemo, useState } from 'react';
import { esportService } from '../services/api.js';

const fallback = [
    { league: 'League européenne de LoL', match: 'Karmine Corp vs G2', time: '19:00', href: 'https://lolesports.com/', source: 'LoL Esports' },
    { league: 'Tour des champions VALORANT', match: 'Fnatic vs Heretics', time: '21:30', href: 'https://valorantesports.com/', source: 'VCT' },
    { league: 'Majeur Rocket League', match: 'Vitality vs BDS', time: '23:00', href: 'https://esports.rocketleague.com/', source: 'RL Esports' },
    { league: 'Majeur CS2', match: 'NAVI vs FaZe', time: '20:00', href: 'https://www.hltv.org/', source: 'HLTV' },
    { league: 'Ligue Call of Duty', match: 'OpTic Texas vs Toronto Ultra', time: '22:00', href: 'https://callofdutyleague.com/', source: 'CDL' },
    { league: 'Série des champions Overwatch', match: 'Team Falcons vs Crazy Raccoon', time: '18:30', href: 'https://esports.overwatch.com/', source: 'OWCS' },
    { league: 'Série mondiale Apex Legends', match: 'TSM vs Alliance', time: '20:45', href: 'https://www.ea.com/games/apex-legends/compete', source: 'ALGS' },
    { league: 'Championnat mondial PUBG', match: 'Gen.G vs Soniqs', time: '21:15', href: 'https://pubgesports.com/', source: 'PUBG Esports' },
    { league: 'Esport Rainbow Six', match: 'BDS vs W7M', time: '19:45', href: 'https://www.ubisoft.com/esports/rainbow-six/siege', source: 'R6 Esports' },
    { league: 'Circuit pro Dota 2', match: 'Team Spirit vs Gaimin Gladiators', time: '23:30', href: 'https://www.dota2.com/esports', source: 'Dota 2' }
];

export default function Esport() {
    const [events, setEvents] = useState(fallback);
    const [filter, setFilter] = useState('Toutes');
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    useEffect(() => { esportService.getLatest(20).then((data) => { const items = data?.data?.items || data?.items || []; if (items.length) setEvents(items); setLastUpdate(new Date()); }).catch(() => {}).finally(() => setLoading(false)); }, []);
    const leagues = useMemo(() => ['Toutes', ...new Set(events.map((event) => event.league).filter(Boolean))], [events]);
    const visible = filter === 'Toutes' ? events : events.filter((event) => event.league === filter);
    return <main className="esport-page"><section className="esport-hero"><div className="esport-hero-grid"/><div className="esport-hero-content"><span className="esport-eyebrow"><i/> LIVE COMPETITION HUB</span><h1>Esport <span>ARENA</span></h1><p>Le calendrier compétitif d’Alpha Gaming : matchs, ligues et affrontements à suivre en direct.</p><div className="esport-hero-meta"><span>◉ {events.length} compétitions suivies</span><span>◷ Mise à jour {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'en cours'}</span></div></div><div className="esport-orb">VS</div></section><section className="esport-section"><div className="esport-section-head"><div><span className="admin-label">PROGRAMME DU JOUR</span><h2>Toutes les compétitions</h2></div><div className="esport-filters">{leagues.slice(0, 6).map((league) => <button className={filter === league ? 'active' : ''} key={league} onClick={() => setFilter(league)}>{league === 'Toutes' ? 'Toutes' : league.replace(/^(Majeur|Tour des champions|Ligue|Série des champions|Série mondiale|Championnat mondial|Circuit pro|Esport|League européenne de) ?/, '').slice(0, 16)}</button>)}</div></div>{loading ? <div className="esport-loading">Synchronisation des compétitions…</div> : <div className="esport-grid">{visible.map((event, index) => <a className="esport-card" href={event.href} target="_blank" rel="noreferrer" key={`${event.match}-${index}`}><div className="esport-card-top"><span className="esport-game-icon">{['◈','✦','◉','◆'][index % 4]}</span><span className="esport-live">LIVE / À VENIR</span></div><span className="esport-league">{event.league}</span><h3>{event.match}</h3><div className="esport-card-footer"><span>◷ {event.time || 'Heure à confirmer'}</span><span>{event.source || 'Circuit officiel'} ↗</span></div></a>)}</div>}</section></main>;
}

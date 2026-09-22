import { useEffect, useMemo, useState } from 'react';
import usePageTitle from '../hooks/usePageTitle.js';
import { Trophy, Clock, Radio, ExternalLink, Flame, Rocket, Target, Zap, Swords, Shield, Medal, Crosshair, Radar, Gamepad2, Activity, ChevronRight } from 'lucide-react';
import { esportService } from '../services/api.js';

// Normalisation des noms de ligues pour éviter les doublons (CS2 / Majeur CS2 / VALORANT / Tour des champions VALORANT...).
const LEAGUE_NORMALIZE = [
    { keys: ['cs2', 'counter'], label: 'CS2', Icon: Zap },
    { keys: ['valorant'], label: 'VALORANT', Icon: Target },
    { keys: ['league', 'lol'], label: 'League of Legends', Icon: Swords },
    { keys: ['dota'], label: 'Dota 2', Icon: Shield },
    { keys: ['rocket'], label: 'Rocket League', Icon: Rocket },
    { keys: ['apex'], label: 'Apex Legends', Icon: Medal },
    { keys: ['rainbow', 'r6', 'siege'], label: 'Rainbow Six', Icon: Crosshair },
    { keys: ['overwatch'], label: 'Overwatch', Icon: Radar },
    { keys: ['call of duty', 'cod'], label: 'Call of Duty', Icon: Gamepad2 },
    { keys: ['esport', 'esports'], label: 'Esport', Icon: Activity }
];

function normalizeLeague(value = '') {
    const l = String(value).toLowerCase();
    const match = LEAGUE_NORMALIZE.find((entry) => entry.keys.some((key) => l.includes(key)));
    if (match) return { label: match.label, Icon: match.Icon };
    return { label: value || 'Esport', Icon: Trophy };
}

export default function Esport() {
    // Titre de page dynamique (RGAA 8.6)
    usePageTitle('Esport');
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('Toutes');
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        esportService.getLatest(20)
            .then((data) => {
                const items = data?.data?.items || data?.items || [];
                if (items.length) setEvents(items);
                setLastUpdate(new Date());
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Ligues dédupliquées : une seule entrée par libellé normalisé + "Toutes".
    const leagues = useMemo(() => {
        const unique = new Map();
        events.forEach((event) => {
            const { label } = normalizeLeague(event.league);
            if (!unique.has(label)) unique.set(label, normalizeLeague(event.league).Icon);
        });
        return [{ label: 'Toutes', Icon: Trophy }, ...Array.from(unique, ([label, Icon]) => ({ label, Icon }))];
    }, [events]);

    const visible = filter === 'Toutes' ? events : events.filter((event) => normalizeLeague(event.league).label === filter);

    return (
        <main className="esport-page">
            <section className="esport-hero">
                <div className="esport-hero-grid" />
                <div className="esport-hero-content">
                    <span className="esport-eyebrow"><i /> LIVE COMPETITION HUB</span>
                    <h1>Esport <span>ARENA</span></h1>
                    <p>Le calendrier compétitif d'Alpha Gaming : matchs, ligues et affrontements à suivre en direct.</p>
                    <div className="esport-hero-meta">
                        <span><Trophy className="h-3.5 w-3.5" /> {events.length} compétitions suivies</span>
                        <span><Radio className="h-3.5 w-3.5" /> Màj {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'en cours'}</span>
                    </div>
                </div>
                <div className="esport-orb">VS</div>
            </section>

            <section className="esport-section">
                <div className="esport-section-head">
                    <div>
                        <span className="admin-label">PROGRAMME DU JOUR</span>
                        <h2>Toutes les compétitions</h2>
                    </div>
                </div>

                <div className="esport-filters">
                    {leagues.map((league) => (
                        <button
                            className={filter === league.label ? 'active' : ''}
                            key={league.label}
                            onClick={() => setFilter(league.label)}
                        >
                            <league.Icon className="h-3.5 w-3.5" /> {league.label}
                        </button>
                    ))}
                    <span className="esport-filter-count">{visible.length} événement(s)</span>
                </div>

                {loading ? (
                    <div className="esport-loading">Synchronisation des compétitions…</div>
                ) : visible.length === 0 ? (
                    <div className="esport-loading">Aucune compétition disponible.</div>
                ) : (
                    <div className="esport-grid">
                        {visible.map((event, index) => {
                            const { Icon } = normalizeLeague(event.league);
                            return (
                                <a className="esport-card esport-card-modern" href={event.href} target="_blank" rel="noreferrer" key={`${event.match}-${index}`}>
                                    <div className="esport-card-top">
                                        <span className="esport-card-league-icon"><Icon className="h-5 w-5" /></span>
                                        <span className="esport-live-badge"><Flame className="h-3 w-3" /> À venir</span>
                                    </div>
                                    <span className="esport-league">{normalizeLeague(event.league).label}</span>
                                    <h3>{event.match}</h3>
                                    <div className="esport-card-footer">
                                        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {event.time || 'Heure à confirmer'}</span>
                                        <span className="inline-flex items-center gap-1.5">{event.source || 'Circuit'}</span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

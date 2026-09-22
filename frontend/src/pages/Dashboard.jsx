// pages/Dashboard.jsx - Page du tableau de bord (route protégée)

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import usePageTitle from '../hooks/usePageTitle.js';
import { authService, gamesService } from '../services/api.js';

// Les jeux affichés proviennent du catalogue chargé depuis l'API.

const gameLinks = {
    'DOOM: Dark Ages': 'https://bethesda.net/en/game/doom',
    'Devil May Cry 5': 'https://www.devilmaycry.com/5/us/',
    'Ninja Gaiden 4': 'https://teamninja-studio.com/',
    'Stellar Blade': 'https://www.playstation.com/games/stellar-blade/',
    'The Legend of Zelda: Echoes of Wisdom': 'https://www.nintendo.com/',
    'Astro Bot': 'https://www.playstation.com/games/astro-bot/',
    'Uncharted 4': 'https://www.playstation.com/games/uncharted-4-a-thiefs-end/',
    'Indiana Jones and the Great Circle': 'https://indianajones.bethesda.net/',
    'Metaphor: ReFantazio': 'https://metaphor.atlus.com/',
    'Final Fantasy VII Rebirth': 'https://ffvii.square-enix-games.com/',
    "Baldur's Gate 3": 'https://baldursgate3.game/',
    "Dragon's Dogma 2": 'https://www.dragonsdogma.com/2/en-us/',
    'Counter-Strike 2': 'https://www.counter-strike.net/cs2',
    'Call of Duty: Black Ops 6': 'https://www.callofduty.com/',
    'THE FINALS': 'https://www.reachthefinals.com/',
    'Battlefield 6': 'https://www.ea.com/games/battlefield',
    'Fortnite': 'https://www.fortnite.com/',
    'Apex Legends': 'https://www.ea.com/games/apex-legends',
    'PUBG: Battlegrounds': 'https://pubg.com/',
    'Warzone': 'https://www.callofduty.com/warzone',
    'EA SPORTS FC 26': 'https://www.ea.com/games/ea-sports-fc',
    'NBA 2K26': 'https://nba.2k.com/',
    'F1 26': 'https://www.ea.com/games/f1',
    'UFC 5': 'https://www.ea.com/games/ufc/ufc-5',
    'Forza Horizon 5': 'https://forza.net/horizon',
    'Gran Turismo 7': 'https://www.gran-turismo.com/',
    'Need for Speed Unbound': 'https://www.ea.com/games/need-for-speed/need-for-speed-unbound',
    'The Crew Motorfest': 'https://www.ubisoft.com/game/the-crew/motorfest',
    'Microsoft Flight Simulator': 'https://www.flightsimulator.com/',
    'Euro Truck Simulator 2': 'https://eurotrucksimulator2.com/',
    'The Sims 4': 'https://www.ea.com/games/the-sims/the-sims-4',
    'Cities: Skylines II': 'https://www.paradoxinteractive.com/games/cities-skylines-ii/about',
    'Age of Empires IV': 'https://www.ageofempires.com/games/age-of-empires-iv/',
    'StarCraft II': 'https://starcraft2.com/',
    'Civilization VI': 'https://civilization.2k.com/civ-vi/',
    'Total War: Warhammer III': 'https://www.totalwar.com/games/warhammer-iii/',
    'Hades II': 'https://www.supergiantgames.com/games/hades-ii/',
    'Hollow Knight': 'https://www.hollowknight.com/',
    'Dead Cells': 'https://dead-cells.com/',
    'Slay the Spire': 'https://www.megacrit.com/',
    'World of Warcraft': 'https://worldofwarcraft.blizzard.com/',
    'Final Fantasy XIV': 'https://na.finalfantasyxiv.com/',
    'Guild Wars 2': 'https://www.guildwars2.com/',
    'The Elder Scrolls Online': 'https://www.elderscrollsonline.com/',
    'Resident Evil 4': 'https://www.residentevil.com/re4/en-us/',
    'Alan Wake 2': 'https://www.alanwake.com/',
    'Dead Space': 'https://www.ea.com/games/dead-space',
    'The Outlast Trials': 'https://redbarrelsgames.com/games/the-outlast-trials/',
    'God of War Ragnarök': 'https://www.playstation.com/games/god-of-war-ragnarok/',
    'Bayonetta 3': 'https://www.nintendo.com/us/store/products/bayonetta-3-switch/',
    'Sekiro: Shadows Die Twice': 'https://www.sekirothegame.com/',
    'Ghost of Tsushima Director\'s Cut': 'https://www.playstation.com/games/ghost-of-tsushima/',
    'Hi-Fi Rush': 'https://hifi-rush.com/',
    'Returnal': 'https://www.playstation.com/games/returnal/',
    'The Last of Us Part II Remastered': 'https://www.playstation.com/games/the-last-of-us-part-ii-remastered/',
    'A Plague Tale: Requiem': 'https://www.asobostudio.com/games/a-plague-tale-requiem',
    'Tchia': 'https://www.tchia.com/',
    'Kena: Bridge of Spirits': 'https://www.kenagame.com/',
    'Prince of Persia: The Lost Crown': 'https://www.ubisoft.com/game/prince-of-persia/the-lost-crown',
    'Life is Strange: Double Exposure': 'https://www.square-enix-games.com/en_US/games/life-is-strange-double-exposure',
    'Elden Ring': 'https://en.bandainamcoent.eu/elden-ring/elden-ring',
    'Persona 5 Royal': 'https://asia.sega.com/p5r/en/',
    'Dragon Quest XI S': 'https://www.dragonquest.jp/dq11s/',
    'Xenoblade Chronicles 3': 'https://www.nintendo.com/us/store/products/xenoblade-chronicles-3-switch/',
    'Tales of Arise': 'https://www.bandainamcoent.com/games/tales-of-arise',
    'Final Fantasy XVI': 'https://www.finalfantasyxvi.com/',
    'Halo Infinite': 'https://www.halowaypoint.com/halo-infinite',
    'Overwatch 2': 'https://overwatch.blizzard.com/',
    'Titanfall 2': 'https://www.ea.com/games/titanfall/titanfall-2',
    'Destiny 2': 'https://www.bungie.net/7/en/Destiny',
    'Rainbow Six Siege': 'https://www.ubisoft.com/game/rainbow-six/siege',
    'DOOM Eternal': 'https://bethesda.net/en/game/doom-eternal',
    'Fall Guys': 'https://www.fallguys.com/',
    'NARAKA: BLADEPOINT': 'https://www.narakathegame.com/',
    'Bloodhunt': 'https://bloodhunt.com/',
    'Super People': 'https://superpeople.com/',
    'Realm Royale Reforged': 'https://www.realmroyale.com/',
    'H1Z1': 'https://www.h1z1.com/',
    'Madden NFL 26': 'https://www.ea.com/games/madden-nfl/madden-nfl-26',
    'NHL 25': 'https://www.ea.com/games/nhl/nhl-25',
    'MLB The Show 25': 'https://www.theshow.com/',
    'TopSpin 2K25': 'https://topspin.2k.com/',
    'WWE 2K25': 'https://wwe.2k.com/',
    'eFootball 2025': 'https://www.konami.com/efootball/en/',
    'F1 25': 'https://www.ea.com/games/f1/f1-25',
    'Wreckfest': 'https://wreckfest.thqnordic.com/',
    'Assetto Corsa Competizione': 'https://assettocorsa.gg/competizione/',
    'Hot Wheels Unleashed 2': 'https://hotwheelsunleashed.com/',
    'MotoGP 24': 'https://www.motogp.com/',
    'Burnout Paradise Remastered': 'https://www.ea.com/games/burnout/burnout-paradise-remastered',
    'Farming Simulator 25': 'https://www.farming-simulator.com/',
    'House Flipper 2': 'https://houseflipper2.com/',
    'Train Sim World 5': 'https://www.trainsimworld.com/',
    'Planet Coaster 2': 'https://www.planetcoaster.com/',
    'Car Mechanic Simulator 2021': 'https://www.carmechanicsimulator.com/',
    'Prison Architect 2': 'https://www.paradoxinteractive.com/games/prison-architect-2/about',
    'Company of Heroes 3': 'https://www.companyofheroes.com/',
    'Crusader Kings III': 'https://www.crusaderkings.com/',
    'Anno 1800': 'https://www.anno-union.com/en/anno-1800/',
    'XCOM 2': 'https://www.xcom.com/',
    'Frostpunk 2': 'https://www.frostpunk2.com/',
    'Northgard': 'https://northgard.com/',
    'Balatro': 'https://www.playbalatro.com/',
    'Celeste': 'https://www.celestegame.com/',
    'Ori and the Will of the Wisps': 'https://www.orithegame.com/',
    'Vampire Survivors': 'https://www.vampiresurvivors.com/',
    'Cult of the Lamb': 'https://www.cultofthelamb.com/',
    'Tunic': 'https://tunicgame.com/',
    'New World': 'https://www.newworld.com/',
    'Black Desert Online': 'https://www.naeu.playblackdesert.com/',
    'Lost Ark': 'https://www.playlostark.com/',
    'RuneScape': 'https://www.runescape.com/',
    'EVE Online': 'https://www.eveonline.com/',
    'Throne and Liberty': 'https://www.playthroneandliberty.com/',
    'Silent Hill 2': 'https://www.silenthill.com/',
    'Resident Evil Village': 'https://www.residentevil.com/village/',
    'Amnesia: The Bunker': 'https://www.amnesiathegame.com/',
    'Layers of Fear': 'https://www.layersoffear.com/',
    'The Casting of Frank Stone': 'https://thecastingoffrankstone.com/',
    'Until Dawn': 'https://www.playstation.com/games/until-dawn/'
};

function Dashboard() {
    // Titre de page dynamique (RGAA 8.6)
    usePageTitle('Mon tableau de bord');
    // Récupération de l'utilisateur et de la fonction logout depuis le contexte
    const { user, logout } = useAuth();

    // États pour gérer le profil, le chargement et les erreurs
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [catalogGames, setCatalogGames] = useState([]);

    // Fonction pour charger le profil depuis l'API protégée
    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await authService.getProfile();
            setProfile(data?.user || data?.data?.user || null);
            setError('');
        } catch (err) {
            setError(err.message || 'Impossible de charger le profil');
        } finally {
            setLoading(false);
        }
    };

    // Chargement du profil au montage du composant
    useEffect(() => {
        loadProfile();
        gamesService.getAll().then((data) => {
            const items = Array.isArray(data?.data?.items) ? data.data.items : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
            setCatalogGames(items);
        }).catch(() => {});
    }, []);

    // Sélection du profil à afficher (depuis l'API ou depuis le contexte)
    const displayUser = profile || user;

    // Formatage de la date de création du compte
    const createdAt = displayUser?.created_at;
    const createdAtLabel = createdAt
        ? new Date(createdAt).toLocaleDateString('fr-FR')
        : 'Non disponible';

    const favoriteIds = new Set((displayUser?.favorite_games || []).map((game) => Number(game.id)));
    const favoriteCatalogGames = catalogGames.filter((game) => favoriteIds.has(Number(game.id)));

    return (
        <div className="relative mx-auto max-w-6xl overflow-visible px-6 py-16 text-slate-100">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 rounded-[2.2rem] bg-linear-to-br from-cyan-500/14 via-slate-900/20 to-blue-500/12"
            />
            {/* En-tête avec titre et bouton de déconnexion */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-widest text-cyan-200/80">Tableau de bord</p>
                    <h1 className="text-3xl font-semibold text-white">Bon retour</h1>
                    <p className="mt-2 text-sm text-slate-300">
                        Donnees chargees depuis le endpoint protege /api/auth/me.
                    </p>
                </div>
                <button onClick={logout} className="btn btn-outline">
                    Deconnexion
                </button>
            </div>

            {/* Grille avec informations du profil */}
            <div className="mt-10">
                {/* Carte principale - Informations du profil */}
                <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/80 p-6 shadow-[0_24px_60px_-32px_rgba(0,167,255,0.4)] backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-cyan-400/35 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100">
                                Profil
                            </span>
                        </div>

                        <button
                            onClick={loadProfile}
                            disabled={loading}
                            className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Chargement...' : 'Rafraichir'}
                        </button>
                    </div>

                    <>
                        {/* Affichage des erreurs */}
                        {error && (
                            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        {/* Grille des informations utilisateur */}
                        {!error && (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                    <p className="text-xs uppercase text-slate-400">Nom</p>
                                    <p className="mt-2 text-sm text-white">
                                        {displayUser?.firstname || '—'} {displayUser?.lastname || ''}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                    <p className="text-xs uppercase text-slate-400">Email</p>
                                    <p className="mt-2 text-sm text-white">{displayUser?.email || '—'}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                    <p className="text-xs uppercase text-slate-400">Membre depuis</p>
                                    <p className="mt-2 text-sm text-white">{createdAtLabel}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                    <p className="text-xs uppercase text-slate-400">Statut</p>
                                    <p className="mt-2 text-sm text-white">Actif</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-xs uppercase text-slate-400">Mes jeux favoris</p>

                                <span className="text-xs text-slate-400">{favoriteCatalogGames.length} jeu(x)</span>
                            </div>

                            {favoriteCatalogGames.length > 0 ? (
                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {favoriteCatalogGames.map((game) => {
                                        const resolvedLink = game.link || gameLinks[game.game_name] || '';

                                        return (
                                            <li key={game.id} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950/70">
                                                {game.image ? <img className="h-32 w-full object-cover" src={game.image} alt={`Jaquette de ${game.game_name}`} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="flex h-32 items-center justify-center text-xs text-slate-500">Jaquette indisponible</div>}
                                                {resolvedLink ? (
                                                    <a
                                                        href={resolvedLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block p-3 text-sm font-semibold text-white underline decoration-cyan-400/60 underline-offset-2 transition hover:text-cyan-200"
                                                    >
                                                        {game.game_name}
                                                    </a>
                                                ) : (
                                                    <span>{game.game_name}</span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-slate-300">Aucun jeu favori enregistré.</p>
                            )}
                        </div>
                    </>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

// scripts/seed-games.mjs
// Remplit le catalogue avec ~50 jeux par catégorie (11 catégories, ~550 jeux).
// - Chaque titre est résolu via l'API OFFICIELLE de recherche Steam (storesearch) : appId exact, jaquette
//   library_600x900_2x vérifiée en HTTP (repli header.jpg, puis capsule), lien = page Steam officielle du jeu.
// - Les 59 jeux « vitrine » déjà insérés (sites officiels des studios) sont préservés : le script est idempotent.
// - Notes /20 cohérentes avec la réception presse/communauté.
// Usage : cd backend && node scripts/seed-games.mjs
import 'dotenv/config';
import mysql from 'mysql2/promise';

// ---- Catalogue par catégorie : [titre, note /20] ----
const GAMES = {
    1: [ // Action
        ['Grand Theft Auto V', 18], ['Red Dead Redemption 2', 19], ['God of War', 18], ['Devil May Cry 5', 17], ['Hades', 18],
        ['Sekiro: Shadows Die Twice', 18], ['DARK SOULS: REMASTERED', 16], ['DARK SOULS II: Scholar of the First Sin', 15], ['Dark Souls III', 17], ['NIOH 2: The Complete Edition', 16],
        ['Monster Hunter: World', 17], ['Monster Hunter Rise', 16], ['Metal Gear Solid V: The Phantom Pain', 18], ['Metal Gear Solid V: Ground Zeroes', 14], ['Death Stranding', 17],
        ['Death Stranding Director\u2019s Cut', 17], ['Control Ultimate Edition', 17], ['Max Payne 3', 17], ['Batman: Arkham Knight', 16], ['Batman: Arkham City', 17],
        ['Middle-earth: Shadow of War', 14], ['Middle-earth: Shadow of Mordor', 16], ['Shadow of the Tomb Raider', 15], ['Rise of the Tomb Raider', 17], ['Dishonored 2', 17],
        ['Dishonored', 16], ['Just Cause 4', 12], ['Far Cry 5', 15], ['Far Cry 6', 13], ['Assassin\u2019s Creed Odyssey', 16],
        ['Assassin\u2019s Creed Valhalla', 14], ['Assassin\u2019s Creed Mirage', 14], ['Ghostwire: Tokyo', 14], ['SCARLET NEXUS', 15], ['Code Vein', 14],
        ['Vanquish', 16], ['Bayonetta', 17], ['NieR:Automata', 17], ['NieR Replicant ver.1.224744871139...', 16], ['Yakuza: Like a Dragon', 16],
        ['Judgment', 16], ['Lost Judgment', 16], ['Marvel\u2019s Spider-Man Remastered', 17], ['Marvel\u2019s Spider-Man: Miles Morales', 16], ['Marvel\u2019s Guardians of the Galaxy', 16],
        ['Horizon Zero Dawn Complete Edition', 15], ['Days Gone', 15], ['Tom Clancy\u2019s Ghost Recon Wildlands', 13], ['Dying Light 2 Stay Human', 14], ['Dying Light', 15],
        ['Dead Island 2', 14], ['Metro Exodus', 17], ['Shadow Warrior 3', 12], ['Ghostrunner', 16], ['Ghostrunner 2', 15], ['RoboCop: Rogue City', 15],
        ['Prince of Persia: The Sands of Time', 15], ['Enslaved: Odyssey to the West Premium Edition', 14], ['Castlevania Anniversary Collection', 13]
    ],
    2: [ // Aventure
        ['It Takes Two', 18], ['Life is Strange', 16], ['Firewatch', 16], ['Inside', 17],
        ['Uncharted: Legacy of Thieves Collection', 16], ['A Plague Tale: Innocence', 16], ['A Plague Tale: Requiem', 16], ['Hellblade: Senua\u2019s Sacrifice', 17], ['Senua\u2019s Saga: Hellblade II', 15],
        ['What Remains of Edith Finch', 17], ['Gone Home', 15], ['Oxenfree', 15], ['Oxenfree II: Lost Signals', 14], ['Night in the Woods', 16],
        ['Gris', 16], ['Journey', 17], ['ABZU', 15], ['The Pathless', 14], ['Spiritfarer', 17],
        ['Kena: Bridge of Spirits', 16], ['Sable', 15], ['Outer Wilds', 18], ['The Longing', 14], ['Kentucky Route Zero: TV Edition', 16],
        ['Detroit: Become Human', 16], ['Heavy Rain', 14], ['Beyond: Two Souls', 13], ['The Quarry', 14], ['The Dark Pictures Anthology: Man of Medan', 12],
        ['The Dark Pictures Anthology: House of Ashes', 14], ['The Dark Pictures Anthology: The Devil in Me', 12], ['The Dark Pictures Anthology: Little Hope', 12], ['Trek to Yomi', 12], ['God of War Ragnar\u00f6k', 17],
        ['Ghost of Tsushima DIRECTOR\u2019S CUT', 17], ['The Last of Us Part I', 16], ['Disco Elysium', 18], ['Subnautica', 17], ['The Long Dark', 16],
        ['Raft', 14], ['Astroneer', 15], ['Slime Rancher', 15], ['Tchia', 14], ['Jusant', 14],
        ['SEASON: A Letter to the Future', 13],        ['Somerville', 12], ['The Stanley Parable: Ultra Deluxe', 16], ['Until Dawn', 14],
        ['Road 96', 15], ['The Gardens Between', 14], ['Far: Changing Tides', 14]
    ],
    3: [ // RPG
        ['The Witcher 3: Wild Hunt', 19], ['Elden Ring', 19], ['Baldur\u2019s Gate 3', 19], ['Skyrim', 18], ['Final Fantasy VII Remake Intergrade', 17], ['Cyberpunk 2077', 16],
        ['Persona 5 Royal', 17], ['Persona 4 Golden', 17], ['Persona 3 Reload', 16], ['Dragon Quest XI: Echoes of an Elusive Age', 16], ['Final Fantasy XVI', 16],
        ['Final Fantasy XIV Online', 16], ['Final Fantasy XV', 14], ['Diablo IV', 15], ['Diablo II: Resurrected', 16], ['Path of Exile', 17],
        ['Path of Exile 2', 16], ['Lost Ark', 14], ['New World', 14], ['Divinity: Original Sin 2', 18], ['Divinity: Original Sin', 16],
        ['Pillars of Eternity', 16], ['Pillars of Eternity II: Deadfire', 16], ['Tyranny', 15], ['Mass Effect Legendary Edition', 17], ['Dragon Age: Origins', 15],
        ['Dragon Age: Inquisition', 14], ['Dragon Age: The Veilguard', 15], ['Kingdom Come: Deliverance', 15], ['Kingdom Come: Deliverance II', 17], ['Fallout 4', 15],
        ['Fallout: New Vegas', 17], ['Wasteland 3', 16], ['Dragon\u2019s Dogma: Dark Arisen', 16], ['Dragon\u2019s Dogma 2', 15], ['Tales of Arise', 15],
        ['Tales of Berseria', 15], ['Octopath Traveler', 15], ['Octopath Traveler II', 16], ['Bravely Default II', 14], ['STAR OCEAN The Divine Force', 14],
        ['Visions of Mana', 14], ['Granblue Fantasy: Relink', 15], ['Like a Dragon: Infinite Wealth', 17], ['Clair Obscur: Expedition 33', 18], ['Vampire: The Masquerade - Bloodlines', 16],
        ['Planescape Torment: Enhanced Edition', 16], ['Baldur\u2019s Gate: Enhanced Edition', 15], ['Icewind Dale: Enhanced Edition', 15], ['Enderal: Forgotten Stories', 15],        ['Solasta: Crown of the Magister', 14], ['GreedFall', 14], ['Wildermyth', 15], ['Battle Chasers: Nightwar', 14]
    ],
    4: [ // Strategie
        ['Civilization VI', 17], ['Stellaris', 17], ['Age of Empires IV', 17], ['Total War: WARHAMMER III', 16], ['Crusader Kings III', 17], ['XCOM 2', 17],
        ['Sid Meier\u2019s Civilization V', 16], ['Sid Meier\u2019s Civilization: Beyond Earth', 12], ['Age of Empires II: Definitive Edition', 17], ['Age of Empires III: Definitive Edition', 14], ['Age of Mythology: Retold', 16],
        ['Total War: THREE KINGDOMS', 15], ['Total War: WARHAMMER II', 15], ['Total War: ROME II', 14], ['Total War: ATTILA', 14], ['Total War: SHOGUN 2', 16],
        ['Total War: EMPIRE', 13], ['Napoleon: Total War', 14], ['Crusader Kings II', 16], ['Europa Universalis IV', 16], ['Hearts of Iron IV', 15],
        ['Victoria 3', 14], ['Imperator: Rome', 12], ['XCOM: Enemy Unknown', 16], ['XCOM: Chimera Squad', 13], ['Phoenix Point', 13],
        ['Gears Tactics', 14], ['Invisible, Inc.', 15], ['Company of Heroes 3', 15], ['Company of Heroes 2', 16], ['Homeworld Remastered Collection', 15],
        ['Homeworld: Deserts of Kharak', 14], ['Northgard', 15], ['Bad North: Jotunn Edition', 14], ['Anno 1800', 16], ['Anno 117: Pax Romana', 15],
        ['Warhammer 40,000: Battlesector', 13], ['Battle Brothers', 15], ['Wartales', 15], ['Songs of Conquest', 16], ['Manor Lords', 15],
        ['HUMANKIND', 13], ['Old World', 15], ['Command & Conquer Remastered Collection', 16], ['Age of Wonders 4', 15], ['Warhammer 40,000: Gladius - Libra Imperialis', 13],
        ['Dune: Spice Wars', 13], ['Tropico 6', 14], ['Democracy 4', 13], ['Battlefleet Gothic: Armada 2', 13], ['Starship Troopers: Terran Command', 12]
    ],
    5: [ // Sport
        ['FIFA 23', 14], ['EA SPORTS FC 24', 14], ['Football Manager 2024', 16], ['Rocket League', 17], ['Forza Horizon 5', 18],
        ['EA SPORTS FC 25', 14], ['NBA 2K25', 13], ['NBA 2K23', 13], ['WWE 2K23', 14], ['WWE 2K24', 14],
        ['TopSpin 2K25', 14], ['F1 24', 15], ['F1 25', 15], ['F1 22', 14], ['F1 2021', 14],
        ['F1 2020', 14], ['F1 Manager 2024', 14], ['F1 Manager 2023', 13], ['MotoGP 24', 14], ['MotoGP 23', 14],
        ['Monster Energy Supercross - The Official Videogame 6', 13], ['TT Isle of Man: Ride on the Edge 3', 13], ['MATCHPOINT - Tennis Championships', 12], ['AO Tennis 2', 11], ['PGA TOUR 2K23', 14],
        ['EA SPORTS PGA TOUR', 13], ['Undisputed', 13], ['Steep', 13], ['Riders Republic', 14], ['Tony Hawk\u2019s Pro Skater 1 + 2', 17],
        ['Session: Skate Sim', 12], ['Skater XL', 12], ['FIFA 22', 13], ['FIFA 21', 12], ['FIFA 20', 12],
        ['eFootball PES 2021 SEASON UPDATE', 13], ['eFootball 2024', 11], ['Football Manager 2023', 16], ['Football Manager 2022', 15], ['Out of the Park Baseball 25', 14],
        ['Cricket 24', 12], ['Rugby 22', 11], ['REMATCH', 14], ['Golf With Your Friends', 13], ['Turbo Golf Racing', 12],
        ['Windjammers 2', 13], ['NBA 2K21', 12], ['Dodgeball Academia', 12], ['Pure Pool', 12], ['Snooker 19', 11],
        ['OlliOlli World', 15], ['Golf It!', 13], ['SkateBIRD', 13], ['Premium Bowling', 12], ['Fishing Planet', 14],
        ['Ultimate Fishing Simulator', 13], ['First Person Tennis - The Real Tennis Simulator', 12], ['Tennis Elbow 4', 12], ['SNOW', 13], ['Pro Cycling Manager 2024', 13],
        ['Bassmaster Fishing 2022', 13], ['Windjammers', 14],
        ['Skate Story', 14], ['WHAT THE GOLF?', 15]
    ],
    6: [ // Course
        ['Forza Motorsport', 15], ['F1 23', 15], ['DiRT Rally 2.0', 16], ['Need for Speed Unbound', 14], ['Assetto Corsa Competizione', 16],
        ['Assetto Corsa', 16], ['Project CARS 3', 13], ['Project CARS 2', 15], ['rFactor 2', 15], ['Automobilista 2', 15],
        ['Le Mans Ultimate', 14], ['EA SPORTS WRC', 15], ['WRC 10', 13], ['WRC 9', 13], ['DIRT 5', 13],
        ['DiRT 4', 14], ['DiRT Rally', 15], ['GRID Legends', 14], ['GRID', 14], ['Burnout Paradise Remastered', 15],
        ['Need for Speed Heat', 14], ['Need for Speed Payback', 11], ['Need for Speed', 12], ['Need for Speed Rivals', 13], ['The Crew Motorfest', 14],
        ['The Crew 2', 13], ['Motorsport Manager', 14], ['Test Drive Unlimited Solar Crown', 12], ['Trackmania', 15], ['BeamNG.drive', 17],
        ['Wreckfest', 16], ['art of rally', 15], ['Hot Wheels Unleashed', 14], ['Hot Wheels Unleashed 2 - Turbocharged', 13], ['Team Sonic Racing', 13],
        ['KartRider: Drift', 12], ['GRIP: Combat Racing', 12], ['MudRunner', 14], ['SnowRunner', 16], ['Expeditions: A MudRunner Game', 13],
        ['Inertial Drift', 13], ['Distance', 13], ['Redout 2', 13], ['Trials Rising', 14], ['Trials Fusion', 13],
        ['Descenders', 14], ['Lonely Mountains: Downhill', 15],
        ['Absolute Drift', 14], ['RaceRoom Racing Experience', 14], ['TrackMania Nations Forever', 14], ['Sonic & All-Stars Racing Transformed Collection', 15], ['JDM: Rise of the Legend', 14], ['Truck Driver', 12],
        ['Redout: Enhanced Edition', 14]
    ],
    7: [ // Shooter
        ['DOOM Eternal', 18], ['Counter-Strike 2', 17], ['Overwatch 2', 14], ['Apex Legends', 15], ['Call of Duty: Modern Warfare II', 14], ['Halo Infinite', 15],
        ['DOOM', 16], ['DOOM 3: BFG Edition', 13], ['DOOM: The Dark Ages', 16], ['Wolfenstein II: The New Colossus', 15], ['Wolfenstein: The New Order', 15],
        ['Wolfenstein: Youngblood', 11], ['Destiny 2', 15], ['Warframe', 15], ['THE FINALS', 14], ['Battlefield 2042', 11],
        ['Battlefield V', 13], ['Battlefield 1', 14], ['Titanfall 2', 17], ['STAR WARS Battlefront II', 13], ['Rainbow Six Siege', 15],
        ['Call of Duty: Black Ops III', 13], ['Call of Duty: WWII', 12], ['Call of Duty: Modern Warfare III', 11], ['PAYDAY 2', 15], ['PAYDAY 3', 11],
        ['Deep Rock Galactic', 16], ['Helldivers 2', 16], ['Killing Floor 2', 14], ['Left 4 Dead 2', 17], ['Back 4 Blood', 12],
        ['Warhammer: Vermintide 2', 15], ['Warhammer 40,000: Darktide', 14], ['Warhammer 40,000: Space Marine 2', 16], ['Hunt: Showdown', 14], ['Squad', 14],
        ['Insurgency: Sandstorm', 14], ['Ready or Not', 14], ['Borderlands 3', 14], ['Tiny Tina\u2019s Wonderlands', 13], ['Half-Life: Alyx', 18],
        ['Half-Life 2', 18], ['Half-Life', 17], ['SUPERHOT', 14], ['RoboCop: Rogue City', 15], ['Crysis Remastered', 12],
        ['Crysis Remastered Trilogy', 13], ['Prey', 16], ['DEATHLOOP', 15], ['Atomic Heart', 13], ['S.T.A.L.K.E.R. 2: Heart of Chornobyl', 14],
        ['Painkiller: Black Edition', 15]
    ],
    8: [ // Plateforme
        ['Little Nightmares II', 16], ['Celeste', 18], ['Hollow Knight', 18], ['Ori and the Will of the Wisps', 17], ['Rayman Legends', 16],
        ['Hollow Knight: Silksong', 18], ['Ori and the Blind Forest: Definitive Edition', 17], ['Little Nightmares', 16], ['Cuphead', 17], ['Shovel Knight: Treasure Trove', 16],
        ['Katana ZERO', 17], ['Blasphemous', 16], ['Blasphemous 2', 15], ['The Messenger', 15], ['A Hat in Time', 15],
        ['Super Meat Boy', 16], ['Super Meat Boy Forever', 12], ['N++', 14], ['Rayman Origins', 16], ['Trine 5: A Clockwork Conspiracy', 14],
        ['Trine 4: The Nightmare Prince', 14], ['Trine 2: Complete Story', 14], ['Yooka-Laylee', 12], ['Guacamelee! 2', 15], ['Guacamelee! Super Turbo Championship Edition', 14],
        ['SKUL: The Hero Slayer', 15], ['Rogue Legacy', 15], ['Rogue Legacy 2', 16], ['Prince of Persia: The Lost Crown', 16], ['Blue Fire', 13],
        ['Aeterna Noctis', 14], ['GRIME', 14], ['ENDER LILIES: Quietus of the Knights', 15], ['Islets', 14], ['FEZ', 14],
        ['Braid, Anniversary Edition', 15], ['Sonic Mania', 16], ['Sonic Origins', 12], ['Crash Bandicoot N. Sane Trilogy', 14], ['Spyro Reignited Trilogy', 15],
        ['KLONOA Phantasy Reverie Series', 13], ['SpongeBob SquarePants: Battle for Bikini Bottom - Rehydrated', 13], ['Rain World', 14], ['Nine Sols', 16], ['ANIMAL WELL', 16],
        ['Spirit of the North 2', 12],
        ['Yoku\u2019s Island Express', 15], ['Pumpkin Jack', 14], ['Souldiers', 15], ['Demon Turf', 14], ['Gato Roboto', 14]
    ],
    9: [ // Puzzle
        ['Portal 2', 19], ['Return of the Obra Dinn', 17], ['Psychonauts 2', 17], ['The Witness', 16], ['Baba Is You', 17], ['Tetris Effect: Connected', 16],
        ['Portal', 18], ['Portal Reloaded', 15], ['The Talos Principle', 16], ['The Talos Principle 2', 15], ['Antichamber', 15],
        ['The Room', 14], ['Human: Fall Flat', 13], ['Unravel', 14], ['Unravel Two', 14], ['LIMBO', 15],
        ['COCOON', 16], ['Chants of Sennaar', 15], ['Blue Prince', 17], ['The Case of the Golden Idol', 15], ['Gorogoa', 14],
        ['Scribblenauts Unlimited', 13], ['Machinarium', 15], ['Samorost 3', 14], ['Botanicula', 13], ['CHUCHEL', 12],
        ['Creaks', 14], ['Happy Game', 12], ['A Monster\u2019s Expedition', 14], ['Patrick\u2019s Parabox', 15], ['Stephen\u2019s Sausage Roll', 15],
        ['The Turing Test', 13], ['Q.U.B.E. 2', 12], ['Superliminal', 15], ['Manifold Garden', 14], ['Maquette', 12],
        ['Viewfinder', 15], ['Snakebird', 13], ['The Pedestrian', 14], ['Genesis Noir', 13], ['Filament', 13],
        ['VOID STRANGER', 15], ['Silt', 12], ['The Entropy Centre', 13], ['Call of the Sea', 14],
        ['LYNE', 14], ['Hexcells Plus', 14], ['Hexcells Infinite', 14], ['Please, Touch The Artwork', 14], ['Islands of Insight', 14]
    ],
    10: [ // Horreur
        ['Resident Evil 4', 18], ['Dead Space', 16], ['Phasmophobia', 16], ['Outlast', 15], ['Alien: Isolation', 16],
        ['Resident Evil 2', 16], ['Resident Evil 3', 14], ['Resident Evil Village', 16], ['Resident Evil 7 Biohazard', 15], ['The Evil Within', 15],
        ['The Evil Within 2', 15], ['Outlast 2', 14], ['The Outlast Trials', 14], ['Amnesia: The Dark Descent', 15], ['Amnesia: Rebirth', 13],
        ['Amnesia: The Bunker', 14], ['SOMA', 16], ['Layers of Fear', 13], ['Layers of Fear 2', 12], ['Blair Witch', 13],
        ['The Medium', 13], ['Chernobylite', 13], ['SILENT HILL 2', 17], ['Dead by Daylight', 14], ['DEVOUR', 14],
        ['Lethal Company', 16], ['The Mortuary Assistant', 14], ['Inscryption', 16], ['Poppy Playtime', 12], ['Choo-Choo Charles', 12],
        ['Five Nights at Freddy\u2019s', 13], ['Five Nights at Freddy\u2019s: Security Breach', 12], ['Visage', 15], ['MADiSON', 13], ['Darkwood', 15],
        ['Cry of Fear', 14], ['The Casting of Frank Stone', 12], ['Song of Horror', 13], ['Sons Of The Forest', 14], ['The Forest', 15],
        ['Green Hell', 13], ['The Texas Chain Saw Massacre', 13], ['GTFO', 13], ['Content Warning', 13], ['Still Wakes the Deep', 14],
        ['Amnesia: A Machine for Pigs', 12], ['Tormented Souls', 13], ['SIGNALIS', 16]
    ],
    11: [ // Indie
        ['Stardew Valley', 19], ['Hades II', 17], ['Terraria', 18], ['Factorio', 19], ['Dead Cells', 17], ['Slay the Spire', 17],
        ['Vampire Survivors', 16], ['Balatro', 17], ['DAVE THE DIVER', 16], ['Cult of the Lamb', 15], ['RimWorld', 17],
        ['Oxygen Not Included', 16], ['Don\u2019t Starve Together', 15], ['Satisfactory', 17], ['Dyson Sphere Program', 16], ['shapez 2', 14],
        ['Mindustry', 15], ['They Are Billions', 14], ['Frostpunk', 16], ['Frostpunk 2', 14], ['This War of Mine', 16],
        ['Cities: Skylines', 16], ['Cities: Skylines II', 13], ['Prison Architect', 15], ['Against the Storm', 16], ['Timberborn', 15],
        ['Dorfromantik', 15], ['ISLANDERS', 13], ['Tiny Glade', 14], ['A Little to the Left', 13], ['Unpacking', 14],
        ['Into the Breach', 16], ['FTL: Faster Than Light', 16], ['Wildfrost', 14], ['Monster Train', 15], ['The Binding of Isaac: Rebirth', 16],
        ['Enter the Gungeon', 15], ['Nuclear Throne', 14], ['Risk of Rain 2', 15], ['Dome Keeper', 13], ['Core Keeper', 15],
        ['Palworld', 14], ['Enshrouded', 14], ['V Rising', 14], ['Project Zomboid', 16], ['7 Days to Die', 14],
        ['Mini Metro', 14], ['Mini Motorways', 14], ['Loop Hero', 14], ['Cobalt Core', 14], ['Peglin', 13],
        ['Luck be a Landlord', 14], ['Backpack Hero', 13]
    ]
};

const STEAM_CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';
const SEARCH_API = 'https://store.steampowered.com/api/storesearch/';
const IMAGE_TIMEOUT_MS = 8000;
const BATCH_SIZE = 8;
const BATCH_DELAY_MS = 120;

const normalize = (value) => String(value || '')
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

async function fetchJson(url, timeoutMs = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AlphaGamingSeed/1.0' },
            signal: controller.signal
        });
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

async function assertImageAvailable(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
    try {
        let response = await fetch(url, { method: 'HEAD', signal: controller.signal });
        if (!response.ok) {
            response = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' }, signal: controller.signal });
        }
        return response.ok;
    } catch {
        return false;
    } finally {
        clearTimeout(timer);
    }
}

// Résout un titre vers l'app Steam officielle : correspondance exacte normalisée d'abord, sinon 1er résultat.
async function resolveApp(title) {
    const url = `${SEARCH_API}?term=${encodeURIComponent(title)}&cc=fr&l=fr&category1=998`;
    let data = await fetchJson(url);
    if (!data) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // anti rate-limit : un seul essai de plus
        data = await fetchJson(url);
    }
    const items = Array.isArray(data?.items) ? data.items : [];
    if (items.length === 0) return null;

    const wanted = normalize(title);
    return items.find((item) => normalize(item.name) === wanted)
        || items.find((item) => normalize(item.name).startsWith(wanted))
        || items[0];
}

// Jaquette : portrait 600x900 si disponible, sinon header, sinon capsule renvoyée par la recherche.
async function resolveCover(appId, fallbackImage) {
    if (appId) {
        const portrait = `${STEAM_CDN}/${appId}/library_600x900_2x.jpg`;
        if (await assertImageAvailable(portrait)) return portrait;
        const header = `${STEAM_CDN}/${appId}/header.jpg`;
        if (await assertImageAvailable(header)) return header;
    }
    if (fallbackImage && fallbackImage.startsWith('https://')) return fallbackImage;
    return null;
}

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Idempotence : titre déjà présent (peu importe la catégorie) => on ne touche pas.
// La table games impose un titre UNIQUE (uq_games_titre).
const [existingRows] = await connection.query('SELECT titre_jeu FROM games');
const existingKeys = new Set(existingRows.map((row) => String(row.titre_jeu).trim().toLowerCase()));

const entries = [];
const seenTitles = new Set();
let duplicatesDropped = [];
for (const [categoryId, games] of Object.entries(GAMES)) {
    for (const [title, note] of games) {
        const key = title.toLowerCase();
        // La table impose un titre UNIQUE : un même jeu dans 2 catégories est impossible.
        if (seenTitles.has(key)) { duplicatesDropped.push(`${title} (cat ${categoryId})`); continue; }
        seenTitles.add(key);
        if (!existingKeys.has(key)) {
            entries.push({ categoryId: Number(categoryId), title, note });
        }
    }
}
if (duplicatesDropped.length) {
    console.log(`${duplicatesDropped.length} doublon(s) de titre ignoré(s) :`);
    duplicatesDropped.forEach((line) => console.log('  - ' + line));
}
console.log(`${entries.length} jeu(x) à résoudre et insérer (hors déjà présents).`);

const failures = [];
let inserted = 0;

for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(async (entry) => {
        const app = await resolveApp(entry.title);
        if (!app?.id) return { entry, error: 'introuvable sur Steam' };
        const image = await resolveCover(app.id, app.tiny_image);
        if (!image) return { entry, error: 'aucune jaquette' };
        return { entry, appId: app.id, image };
    }));
    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));

    for (const result of results) {
        if (result.error) {
            failures.push(`${result.entry.title} (cat ${result.entry.categoryId}) : ${result.error}`);
            continue;
        }
        const { entry, appId, image } = result;
        try {
            await connection.execute(
                'INSERT IGNORE INTO games (categorie_id, titre_jeu, lien, image, note, is_external) VALUES (?, ?, ?, ?, ?, 0)',
                [entry.categoryId, entry.title, `https://store.steampowered.com/app/${appId}`, image, entry.note]
            );
            inserted += 1;
        } catch (insertError) {
            failures.push(`${entry.title} : insertion échouée (${insertError.code || insertError.message})`);
        }
    }
    const done = Math.min(i + BATCH_SIZE, entries.length);
    console.log(`Progression : ${done}/${entries.length} (insérés : ${inserted})`);
}

console.log(`\nTerminé : ${inserted} inséré(s), ${failures.length} échec(s).`);
if (failures.length) {
    console.log('\nÉCHECS :');
    failures.forEach((line) => console.log('  ! ' + line));
}

// Contrôle final : nombre de jeux par catégorie.
const [counts] = await connection.query(
    'SELECT c.name, COUNT(g.id) AS total FROM categories c LEFT JOIN games g ON g.categorie_id = c.id GROUP BY c.id ORDER BY c.id'
);
console.log('\nJEUX PAR CATÉGORIE :');
counts.forEach((row) => console.log(`  ${row.name}: ${row.total}`));

await connection.end();

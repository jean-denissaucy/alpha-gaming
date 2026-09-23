// scripts/seed-games.mjs
// Catalogue STRICTEMENT 2025/2026/2027 : aucun jeu antérieur à 2025.
// - Chaque titre est résolu via l'API officielle Steam (storesearch), puis son ANNÉE DE SORTIE
//   est vérifiée via appdetails : si l'année Steam est < 2025, le jeu est REFUSÉ et journalisé.
// - Note /20 uniquement pour les jeux déjà sortis (réception presse/communauté) ; NULL pour les sorties à venir.
// - Jaquette library_600x900_2x vérifiée en HTTP (repli header.jpg puis capsule).
// - OFFICIAL_GAMES : titres sans page Steam (ex. GTA VI) insérés avec lien officiel de l'éditeur.
// Idempotent : relançable sans dupliquer. Usage : cd backend && node scripts/seed-games.mjs
import 'dotenv/config';
import mysql from 'mysql2/promise';

const MIN_YEAR = 2025;

// ---- Jeux 2025/2026/2027 par catégorie : [titre, note /20 ou null si sortie à venir] ----
const GAMES = {
    1: [ // Action
        ['Monster Hunter Wilds', 14],
        ['Assassin\u2019s Creed Shadows', 15],
        ['Elden Ring Nightreign', 14],
        ['Like a Dragon: Pirate Yakuza in Hawaii', 15],
        ['Dynasty Warriors: Origins', 15],
        ['Metal Gear Solid Delta: Snake Eater', 16],
        ['Mafia: The Old Country', 13],
        ['WUCHANG: Fallen Feathers', 13],
        ['HELL IS US', 14],
        ['Ninja Gaiden 4', 14],
        ['The First Berserker: Khazan', 15],
        ['South of Midnight', 14],
        ['Stellar Blade', 15],
        ['NIOH 3', null],
        ['Crimson Desert', null],
        ['007 First Light', null],
        ['Onimusha: Way of the Sword', null],
        ['Pragmata', null],
        ['Phantom Blade Zero', null],
        ['Lost Soul Aside', 13],
        ['Beast of Reincarnation', null],
        ['Dying Light: The Beast', 14],
        ['Marvel’s Spider-Man 2', 15],
        ['Terminator 2D: No Fate', 14],
        ['Ninja Gaiden: Ragebound', 15],
        ['Shadow Labyrinth', 12],
        ['Freedom Wars Remastered', 14],
        ['Tomb Raider IV-VI Remastered', 13],
        ['MindsEye', 8],
        ['Assassin’s Creed Black Flag Resynced', null],
        ['My Hero Academia: All’s Justice', null]
    ],
    2: [ // Aventure
        ['Split Fiction', 17],
        ['Atomfall', 14],
        ['Baby Steps', 13],
        ['Dispatch', 17],
        ['Dune: Awakening', 14],
        ['Grounded 2', 14],
        ['The Hundred Line: Last Defense Academy', 16],
        ['Subnautica 2', null],
        ['Fable', null],
        ['Big Walk', null],
        ['Sword of the Sea', 15],
        ['Lost Records: Bloom & Rage', 14],
        ['The Last of Us Part II Remastered', 15]
    ],
    3: [ // RPG
        ['Clair Obscur: Expedition 33', 18],
        ['Kingdom Come: Deliverance II', 17],
        ['Avowed', 15],
        ['The Outer Worlds 2', 15],
        ['Where Winds Meet', 15],
        ['Vampire: The Masquerade - Bloodlines 2', 12],
        ['The Blood of Dawnwalker', null],
        ['Moonlighter 2: The Endless Vault', null],
        ['Tainted Grail: The Fall of Avalon', 15],
        ['Tales of Graces f Remastered', 14],
        ['Atelier Yumia: The Alchemist of Memories & the Envisioned Land', 14],
        ['Trails in the Sky 1st Chapter', 16],
        ['RAIDOU Remastered: The Mystery of the Soulless Army', 15],
        ['DRAGON QUEST I & II HD-2D Remake', 16],
        ['OCTOPATH TRAVELER 0', 15],
        ['Digimon Story Time Stranger', 15],
        ['Rune Factory: Guardians of Azuma', 13],
        ['SaGa Frontier 2 Remaster', 13],
        ['Persona 5: The Phantom X', 12]
    ],
    4: [ // Strategie
        ['The Alters', 16],
        ['Tempest Rising', 15],
        ['Cataclismo', 14],
        ['Anno 117: Pax Romana', 16],
        ['Age of Darkness: Final Stand', 13],
        ['Two Point Museum', 15],
        ['Jurassic World Evolution 3', 14],
        ['Fata Deum', 12]
    ],
    5: [ // Sport
        ['EA SPORTS FC 26', 14],
        ['NBA 2K26', 13],
        ['F1 25', 15],
        ['MotoGP 25', 14],
        ['Tony Hawk\u2019s Pro Skater 3 + 4', 15],
        ['REMATCH', 14],
        ['Football Manager 26', 15],
        ['Fatal Fury: City of the Wolves', 14],
        ['NBA 2K27', null],
        ['F1 26', null],
        ['MotoGP 26', null],
        ['WWE 2K25', 14],
        ['PGA TOUR 2K25', 14],
        ['Rugby 25', 12],
        ['Everybody’s Golf: Hot Shots', 12],
        ['Out of the Park Baseball 26', 14],
        ['skate.', 13]
    ],
    6: [ // Course
        ['Sonic Racing: CrossWorlds', 15],
        ['Forza Horizon 6', null],
        ['Tokyo Xtreme Racer', 14],
        ['Assetto Corsa EVO', 14],
        ['Wreckfest 2', 13],
        ['Haste', 15],
        ['NASCAR 25', 12]
    ],
    7: [ // Shooter
        ['DOOM: The Dark Ages', 16],
        ['Battlefield 6', 16],
        ['Borderlands 4', 14],
        ['ARC Raiders', 16],
        ['Call of Duty: Black Ops 7', 12],
        ['The Outer Worlds 2', 15],
        ['Sniper Elite: Resistance', 14],
        ['Gears of War: Reloaded', 13],
        ['Halo: Campaign Evolved', null],
        ['Marathon', null],
        ['Killing Floor 3', 12],
        ['Wildgate', 15],
        ['FragPunk', 13],
        ['Arena Breakout: Infinite', 12],
        ['Mecha BREAK', 12],
        ['Abyssus', 15]
    ],
    8: [ // Plateforme
        ['Hollow Knight: Silksong', 18],
        ['Little Nightmares III', 13],
        ['Ender Magnolia: Bloom in the Mist', 16],
        ['ABSOLUM', 16],
        ['Yooka-Replaylee', 15],
        ['Mouse: P.I. For Hire', null],
        ['Pac-Man World 2 Re-PAC', 13]
    ],
    9: [ // Puzzle
        ['Blue Prince', 17],
        ['Keeper', 15],
        ['Lumines Arise', null],
        ['The Roottrees are Dead', 16],
        ['A Game About Digging A Hole', 13],
        ['Is This Seat Taken?', 14],
        ['Bionic Bay', 15]
    ],
    10: [ // Horreur
        ['SILENT HILL f', 16],
        ['Routine', 14],
        ['Resident Evil Requiem', null],
        ['Cronos: The New Dawn', 15],
        ['Tormented Souls 2', 13],
        ['Post Trauma', 13],
        ['Karma: The Dark World', 14],
        ['Horses', 13],
        ['Directive 8020', null]
    ],
    11: [ // Indie
        ['DELTARUNE', 17],
        ['PEAK', 16],
        ['Monster Train 2', 16],
        ['Wanderstop', 15],
        ['Keep Driving', 15],
        ['Hyper Light Breaker', 12],
        ['Hades II', 17],
        ['BALL x PIT', 15],
        ['Mudborne', 14],
        ['The Winter Burrow', 14],
        ['Schedule I', 16],
        ['R.E.P.O.', 16],
        ['Megabonk', 16],
        ['CloverPit', 15]
    ]
};

// Jeux majeurs SANS page Steam : lien vers le site officiel de l'éditeur, jaquette indisponible.
const OFFICIAL_GAMES = [
    { title: 'Grand Theft Auto VI', categoryId: 1, year: 2026, note: null, link: 'https://www.rockstargames.com/games/gtavi' },
    { title: 'Ghost of Yōtei', categoryId: 1, year: 2025, note: 17, link: 'https://www.playstation.com/en-us/games/ghost-of-yotei/' },
    { title: 'Hyrule Warriors: Age of Imprisonment', categoryId: 1, year: 2025, note: 14, link: 'https://www.nintendo.com/us/store/products/hyrule-warriors-age-of-imprisonment-switch-2/' },
    { title: 'Marvel’s Wolverine', categoryId: 1, year: 2026, note: null, link: 'https://www.playstation.com/en-us/games/marvels-wolverine/' },
    { title: 'Pokémon Legends: Z-A', categoryId: 3, year: 2025, note: 15, link: 'https://www.nintendo.com/us/store/products/pokemon-legends-z-a-switch/' },
    { title: 'Fire Emblem Fortune’s Weave', categoryId: 4, year: 2026, note: null, link: 'https://www.nintendo.com/us/store/products/fire-emblem-fortunes-weave-switch-2/' },
    { title: 'MARVEL Tokon: Fighting Souls', categoryId: 5, year: 2026, note: null, link: 'https://www.playstation.com/en-us/games/marvel-tokon-fighting-souls/' },
    { title: 'Kirby Air Riders', categoryId: 6, year: 2025, note: 15, link: 'https://www.nintendo.com/us/store/products/kirby-air-riders-switch-2/' },
    { title: 'Metroid Prime 4: Beyond', categoryId: 7, year: 2025, note: 16, link: 'https://www.nintendo.com/us/store/products/metroid-prime-4-beyond-switch-2/' },
    { title: 'Donkey Kong Bananza', categoryId: 8, year: 2025, note: 17, link: 'https://www.nintendo.com/us/store/products/donkey-kong-bananza-switch-2/' },
    { title: 'Days Gone Remastered', categoryId: 1, year: 2025, note: 14, link: 'https://www.playstation.com/en-us/games/days-gone-remastered/' }
];

const STEAM_CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';
const SEARCH_API = 'https://store.steampowered.com/api/storesearch/';
const DETAILS_API = 'https://store.steampowered.com/api/appdetails/';
const IMAGE_TIMEOUT_MS = 8000;
const BATCH_SIZE = 6;
const BATCH_DELAY_MS = 150;

// Titres que la recherche Steam ne trouve pas à cause de caractères spéciaux (Δ, ®, ™…) :
// clé = titre normalisé, valeur = appId Steam officiel vérifié.
const APP_ID_OVERRIDES = {
    'metal gear solid delta snake eater': 2417610, // METAL GEAR SOLID Δ: SNAKE EATER
    'vampire the masquerade bloodlines 2': 532790,
    "tony hawk s pro skater 3 4": 2545710,
    'the winter burrow': 3008740
};

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

async function resolveApp(title) {
    const overridden = APP_ID_OVERRIDES[normalize(title)];
    if (overridden) return { id: overridden, name: title, tiny_image: null };
    const url = `${SEARCH_API}?term=${encodeURIComponent(title)}&cc=fr&l=fr&category1=998`;
    let data = await fetchJson(url);
    if (!data) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        data = await fetchJson(url);
    }
    const items = Array.isArray(data?.items) ? data.items : [];
    if (items.length === 0) return null;
    const wanted = normalize(title);
    return items.find((item) => normalize(item.name) === wanted)
        || items.find((item) => normalize(item.name).startsWith(wanted))
        || items[0];
}

// Année de sortie OFFICIELLE depuis appdetails : gère "3 févr. 2025", "Coming soon", "2026"…
function extractYear(details) {
    const releaseDate = details?.release_date;
    if (!releaseDate) return null;
    if (releaseDate.coming_soon) {
        const match = String(releaseDate.date || '').match(/(20[2-9]\d)/);
        return match ? Number(match[1]) : null;
    }
    const match = String(releaseDate.date || '').match(/(20[0-2]\d)/);
    return match ? Number(match[1]) : null;
}

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

// Idempotence : titre déjà présent => on ne touche pas.
const [existingRows] = await connection.query('SELECT titre_jeu FROM games');
const existingKeys = new Set(existingRows.map((row) => String(row.titre_jeu).trim().toLowerCase()));

const entries = [];
const seenTitles = new Set();
let duplicates = 0;
for (const [categoryId, games] of Object.entries(GAMES)) {
    for (const [title, note] of games) {
        const key = title.toLowerCase();
        if (seenTitles.has(key)) { duplicates += 1; continue; }
        seenTitles.add(key);
        if (!existingKeys.has(key)) {
            entries.push({ categoryId: Number(categoryId), title, note, official: false });
        }
    }
}
for (const game of OFFICIAL_GAMES) {
    const key = game.title.toLowerCase();
    if (seenTitles.has(key)) { duplicates += 1; continue; }
    seenTitles.add(key);
    if (!existingKeys.has(key)) {
        entries.push({ categoryId: game.categoryId, title: game.title, note: game.note, official: true, link: game.link, year: game.year });
    }
}
console.log(`${entries.length} jeu(x) 2025+ à traiter (${duplicates} doublon(s) ignoré(s)).`);

const failures = [];
const rejectedOld = [];
let inserted = 0;

for (const entry of entries) {
    if (entry.official) {
        // Sans page Steam : année déclarée par l'éditeur, pas de jaquette.
        await connection.execute(
            'INSERT IGNORE INTO games (categorie_id, titre_jeu, lien, image, note, release_year, is_external) VALUES (?, ?, ?, NULL, ?, ?, 0)',
            [entry.categoryId, entry.title, entry.link, entry.note, entry.year]
        );
        inserted += 1;
        console.log(`+ ${entry.title} (${entry.year}, site officiel)`);
        continue;
    }

    const app = await resolveApp(entry.title);
    if (!app?.id) {
        failures.push(`${entry.title} (cat ${entry.categoryId}) : introuvable sur Steam`);
        continue;
    }

    // VÉRIFICATION DE L'ANNÉE : appdetails officiel. Refus catégorique si < 2025.
    const details = await fetchJson(`${DETAILS_API}?appids=${app.id}&l=english`);
    const year = extractYear(details?.[String(app.id)]?.data);
    if (!year || year < MIN_YEAR) {
        rejectedOld.push(`${entry.title} — année Steam : ${year ?? 'inconnue'} (< ${MIN_YEAR})`);
        continue;
    }

    const image = await resolveCover(app.id, app.tiny_image);
    if (!image) {
        failures.push(`${entry.title} : aucune jaquette`);
        continue;
    }

    try {
        await connection.execute(
            'INSERT IGNORE INTO games (categorie_id, titre_jeu, lien, image, note, release_year, is_external) VALUES (?, ?, ?, ?, ?, ?, 0)',
            [entry.categoryId, entry.title, `https://store.steampowered.com/app/${app.id}`, image, entry.note, year]
        );
        inserted += 1;
        console.log(`+ ${entry.title} (${year}${entry.note != null ? `, note ${entry.note}/20` : ', à venir'})`);
    } catch (insertError) {
        failures.push(`${entry.title} : insertion échouée (${insertError.code || insertError.message})`);
    }
    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
}

console.log(`\nTerminé : ${inserted} inséré(s), ${rejectedOld.length} refusé(s) (avant ${MIN_YEAR}), ${failures.length} échec(s).`);
if (rejectedOld.length) {
    console.log('\nREFUSÉS (année < 2025) :');
    rejectedOld.forEach((line) => console.log('  x ' + line));
}
if (failures.length) {
    console.log('\nÉCHECS :');
    failures.forEach((line) => console.log('  ! ' + line));
}

// Rattrapage : les jeux « à venir » sans date exploitable côté Steam sont datés 2026
// (fenêtre d'annonce éditeur la plus probable). Idempotent : ne touche que les lignes NULL.
await connection.execute(
    "UPDATE games SET release_year = 2026 WHERE release_year IS NULL AND lien LIKE 'https://store.steampowered.com/%'"
);

const [counts] = await connection.query(
    'SELECT c.name, COUNT(g.id) AS total FROM categories c LEFT JOIN games g ON g.categorie_id = c.id GROUP BY c.id ORDER BY c.id'
);
const [years] = await connection.query('SELECT release_year, COUNT(*) AS total FROM games GROUP BY release_year ORDER BY release_year');
console.log('\nJEUX PAR CATÉGORIE :');
counts.forEach((row) => console.log(`  ${row.name}: ${row.total}`));
console.log('\nJEUX PAR ANNÉE :');
years.forEach((row) => console.log(`  ${row.release_year ?? 'sans année'}: ${row.total}`));

await connection.end();

// scripts/seed-games.mjs
// Remplit le catalogue avec 50 jeux répartis dans les 11 catégories.
// - Jaquettes : CDN officiel Steam (library_600x900, portrait 2:3 — format des cartes du site),
//   repli automatique sur header.jpg si la version portrait n'existe pas, vérification HTTP avant insertion.
// - Liens : site officiel du jeu (studio/éditeur) ; page Steam officielle à défaut.
// - Notes : appréciations presse/communauté sur 20, cohérentes avec la réception réelle du jeu.
// Usage : cd backend && node scripts/seed-games.mjs
import 'dotenv/config';
import mysql from 'mysql2/promise';

// ---- Données : [titre, appIdSteam, lien officiel, note /20] ----
const GAMES_BY_CATEGORY = {
    1: [ // Action
        ['Grand Theft Auto V', 271590, 'https://www.rockstargames.com/games/gtav', 18],
        ['Red Dead Redemption 2', 1174180, 'https://www.rockstargames.com/games/reddeadredemption2', 19],
        ['God of War', 1593500, 'https://www.playstation.com/en-us/games/god-of-war/', 18],
        ['Devil May Cry 5', 601150, 'https://www.devilmaycry5.com/', 17],
        ['Hades', 1145360, 'https://www.supergiantgames.com/games/hades/', 18]
    ],
    2: [ // Aventure
        ['It Takes Two', 1426210, 'https://www.ea.com/games/it-takes-two', 18],
        ['Life is Strange', 319630, 'https://www.lifeisstrange.com/', 16],
        ['Firewatch', 383870, 'https://www.firewatchgame.com/', 16],
        ['Inside', 304430, 'https://playdead.com/games/inside/', 17]
    ],
    3: [ // RPG
        ['The Witcher 3: Wild Hunt', 292030, 'https://www.thewitcher.com/', 19],
        ['Elden Ring', 1245620, 'https://en.bandainamcoent.eu/elden-ring/elden-ring', 19],
        ['Baldur\u2019s Gate 3', 1086940, 'https://baldursgate3.game/', 19],
        ['Skyrim', 72850, 'https://elderscrolls.bethesda.net/en/skyrim/', 18],
        ['Final Fantasy VII Remake Intergrade', 1462040, 'https://ffvii-remake-intergrade.square-enix-games.com/', 17],
        ['Cyberpunk 2077', 1091500, 'https://www.cyberpunk.net/', 16]
    ],
    4: [ // Strategie
        ['Civilization VI', 289070, 'https://www.civilization.com/', 17],
        ['Stellaris', 281990, 'https://stellaris.paradoxplaza.com/', 17],
        ['Age of Empires IV', 1466860, 'https://www.ageofempires.com/games/age-of-empires-iv/', 17],
        ['Total War: WARHAMMER III', 1142710, 'https://www.totalwar.com/games/warhammer-iii/', 16],
        ['Crusader Kings III', 1158310, 'https://www.crusaderkings.com/', 17],
        ['XCOM 2', 268500, 'https://www.xcom.com/games/xcom-2/', 17]
    ],
    5: [ // Sport
        ['FIFA 23', 1811260, 'https://www.ea.com/games/ea-sports-fifa/fifa-23', 14],
        ['EA SPORTS FC 24', 2195250, 'https://www.ea.com/games/ea-sports-fc/fc-24', 14],
        ['Football Manager 2024', 2252570, 'https://www.footballmanager.com/', 16],
        ['Rocket League', 252950, 'https://www.rocketleague.com/', 17],
        ['Forza Horizon 5', 1551360, 'https://forza.net/games/forza-horizon-5', 18]
    ],
    6: [ // Course
        ['Forza Motorsport', 2440510, 'https://forza.net/games/forza-motorsport', 15],
        ['F1 23', 2108330, 'https://www.ea.com/games/f1/f1-23', 15],
        ['Dirt Rally 2.0', 690790, 'https://www.dirtgame.com/', 16],
        ['Need for Speed Unbound', 1846380, 'https://www.ea.com/games/need-for-speed/need-for-speed-unbound', 14],
        ['Assetto Corsa Competizione', 805550, 'https://www.assettocorsa.net/competizione/', 16]
    ],
    7: [ // Shooter
        ['DOOM Eternal', 782330, 'https://doom.com/', 18],
        ['Counter-Strike 2', 730, 'https://www.counter-strike.net/', 17],
        ['Overwatch 2', 2357570, 'https://overwatch.blizzard.com/', 14],
        ['Apex Legends', 1172470, 'https://www.ea.com/games/apex-legends', 15],
        ['Call of Duty: Modern Warfare II (2022)', 1938090, 'https://www.callofduty.com/modernwarfare2', 14],
        ['Halo Infinite', 1240440, 'https://www.halowaypoint.com/halo-infinite', 15]
    ],
    8: [ // Plateforme
        ['Little Nightmares II', 860510, 'https://www.bandainamcoent.eu/little-nightmares/little-nightmares-2', 16],
        ['Celeste', 504230, 'https://www.celestegame.com/', 18],
        ['Hollow Knight', 367520, 'https://www.teamcherry.com.au/hollow-knight', 18],
        ['Ori and the Will of the Wisps', 1057090, 'https://www.orithegame.com/', 17],
        ['Rayman Legends', 242550, 'https://www.ubisoft.com/en-us/game/rayman/rayman-legends', 16]
    ],
    9: [ // Puzzle
        ['Portal 2', 620, 'https://www.thinkwithportals.com/', 19],
        ['Return of the Obra Dinn', 653530, 'https://obradinn.com/', 17],
        ['Psychonauts 2', 607080, 'https://www.doublefine.com/games/psychonauts-2', 17],
        ['Baba Is You', 736260, 'https://hempuli.com/baba/', 17],
        ['Tetris Effect: Connected', 1003590, 'https://www.tetriseffect.game/', 16]
    ],
    10: [ // Horreur
        ['Resident Evil 4 (2023)', 2050650, 'https://www.residentevil.com/re4/', 18],
        ['Dead Space (2023)', 1693980, 'https://www.ea.com/games/dead-space', 16],
        ['Phasmophobia', 739630, 'https://www.kineticgames.co.uk/', 16],
        ['Outlast', 238320, 'https://redbarrelsgames.com/games/outlast', 15],
        ['Alien: Isolation', 214490, 'https://www.sega.com/alien-isolation', 16]
    ],
    11: [ // Indie
        ['Stardew Valley', 413150, 'https://www.stardewvalley.net/', 19],
        ['Hades II', 1145350, 'https://www.supergiantgames.com/games/hades-ii/', 17],
        ['Terraria', 105600, 'https://terraria.org/', 18],
        ['Factorio', 427520, 'https://www.factorio.com/', 19],
        ['Dead Cells', 588650, 'https://deadcells.com/', 17],
        ['Slay the Spire', 646570, 'https://www.megacrit.com/', 17]
    ]
};

const STEAM_CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';
const IMAGE_TIMEOUT_MS = 8000;

// Vérifie qu'une URL d'image est bien servie (HEAD, repli GET, 8 s max).
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

// Construit l'URL de jaquette : portrait 600x900 si disponible, sinon header horizontal.
async function resolveCover(appId) {
    if (!appId) return null;
    const portrait = `${STEAM_CDN}/${appId}/library_600x900_2x.jpg`;
    if (await assertImageAvailable(portrait)) return portrait;
    const header = `${STEAM_CDN}/${appId}/header.jpg`;
    if (await assertImageAvailable(header)) return header;
    return null;
}

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Idempotent : ne réinsère pas un jeu déjà présent (même titre, même catégorie).
const [existingRows] = await connection.query('SELECT titre_jeu, categorie_id FROM games');
const existingKeys = new Set(existingRows.map((row) => `${String(row.titre_jeu).trim().toLowerCase()}::${row.categorie_id}`));

let inserted = 0;
let skipped = 0;
let noCover = 0;

for (const [categoryId, games] of Object.entries(GAMES_BY_CATEGORY)) {
    for (const [title, appId, link, note] of games) {
        const key = `${title.toLowerCase()}::${categoryId}`;
        if (existingKeys.has(key)) {
            console.log(`- déjà présent, ignoré : ${title}`);
            skipped += 1;
            continue;
        }

        const image = await resolveCover(appId);
        if (!image) {
            console.log(`! aucune jaquette trouvée, jeu ignoré : ${title} (appId ${appId})`);
            noCover += 1;
            continue;
        }

        await connection.execute(
            'INSERT INTO games (categorie_id, titre_jeu, lien, image, note, is_external) VALUES (?, ?, ?, ?, ?, 0)',
            [Number(categoryId), title, link, image, note]
        );
        inserted += 1;
        console.log(`+ ${title} — note ${note}/20 — ${image}`);
    }
}

console.log(`\nTerminé : ${inserted} inséré(s), ${skipped} déjà présent(s), ${noCover} sans jaquette.`);
await connection.end();

import https from 'https';
import Parser from 'rss-parser';
import { query } from '../config/db.js';
import { buildErrorResponse, buildSuccessResponse } from '../utils/response.js';

const GAMEKULT_TESTS_URL = 'https://www.gamekult.com/tests.html';

const parser = new Parser({
    timeout: 9000,
    customFields: {
        item: ['content:encoded', 'media:content', 'media:thumbnail', 'media:group']
    }
});

const FEEDS = [
    { url: 'https://www.actugaming.net/feed/', source: 'ActuGaming.net' },
    { url: 'https://www.jeuxvideo.com/rss/rss.xml', source: 'JeuxVideo.com' },
    { url: 'https://www.gamekult.com/feed.xml', source: 'Gamekult' },
    { url: 'https://www.gamergen.com/rss', source: 'GamerGen' },
    { url: 'https://www.pushstart.fr/feed/', source: 'Push Start' }
];

const ESPORT_FEEDS = [
    { url: 'https://www.hltv.org/rss/news', source: 'HLTV', league: 'CS2' },
    { url: 'https://www.vlr.gg/rss', source: 'VLR', league: 'VALORANT' },
    { url: 'https://esports.gg/feed/', source: 'Esports.gg', league: 'Esport' },
    { url: 'https://dotesports.com/feed', source: 'Dot Esports', league: 'Esport' }
];

// Fenêtre de fraîcheur : au-delà, on considère la table périmée et on re-tire les flux.
const STALE_AFTER_MS = 22 * 60 * 60 * 1000; // 22h (le cron passe toutes les 24h)



function decodeEntities(input = '') {
    const entities = {
        '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&apos;': "'", '&nbsp;': ' ',
        '&eacute;': 'é', '&egrave;': 'è', '&ecirc;': 'ê', '&agrave;': 'à', '&ccedil;': 'ç',
        '&ocirc;': 'ô', '&ucirc;': 'û', '&icirc;': 'î', '&euro;': '€', '&laquo;': '«', '&raquo;': '»',
        '&hellip;': '…', '&mdash;': '—', '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”'
    };
    return String(input || '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&[a-zA-Z#0-9]+;/g, (match) => entities[match] || match);
}

function stripHtml(input = '') {
    return decodeEntities(String(input || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function extractImage(item = {}) {
    const candidates = [
        item.image,
        item.thumbnail,
        item.imageUrl,
        item.enclosure,
        item['media:content'],
        item['media:thumbnail'],
        item['media:group']?.['media:content'],
        item['media:group']?.['media:thumbnail']
    ];

    const findImageUrl = (value) => {
        if (!value) return null;
        if (typeof value === 'string') return /^https?:\/\//i.test(value) ? value : null;
        if (Array.isArray(value)) return value.map(findImageUrl).find(Boolean) || null;
        if (typeof value === 'object') {
            return findImageUrl(value.url)
                || findImageUrl(value.href)
                || findImageUrl(value.$?.url)
                || findImageUrl(value.$?.href)
                || findImageUrl(value['media:content'])
                || findImageUrl(value['media:thumbnail']);
        }
        return null;
    };

    const directImage = candidates.map(findImageUrl).find(Boolean);
    if (directImage) return directImage;

    const html = item['content:encoded'] || item.content || '';
    const htmlImage = String(html).match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
    return /^https?:\/\//i.test(htmlImage || '') ? htmlImage : null;
}

function cleanTitle(title = '') {
    return stripHtml(title).replace(/\s+/g, ' ').trim();
}

function deduplicate(items = []) {
    const seen = new Set();
    return items.filter((item) => {
        const key = item.url || `${item.source}:${item.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function inferCategory(title = '') {
    const normalized = title.toLowerCase();

    if (/(nintendo|switch|zelda|mario|pokemon)/.test(normalized)) return 'Nintendo';
    if (/(xbox|playstation|ps5|pc|steam)/.test(normalized)) return 'Plateformes';
    if (/(esport|esports|major|league|tour|championship)/.test(normalized)) return 'Esport';
    if (/(indie|indé|independant|independent)/.test(normalized)) return 'Indé';
    return 'Jeux vidéo';
}

function estimateReadingTime(text = '') {
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(2, Math.round(words / 180));
    return `${minutes} min`;
}

function inferLeague(title = '', fallbackLeague = 'Esport') {
    const normalized = title.toLowerCase();

    if (/(rocket league|rlcs)/.test(normalized)) return 'Majeur Rocket League';
    if (/(counter-strike|cs2|cs:go)/.test(normalized)) return 'Majeur CS2';
    if (/(valorant|vct)/.test(normalized)) return 'Tour des champions VALORANT';
    if (/(league of legends|lec|lck|lpl|lcs)/.test(normalized)) return 'League européenne de LoL';
    if (/(dota|dota 2|ti\b|the international)/.test(normalized)) return 'Circuit pro Dota 2';
    if (/(apex|algs)/.test(normalized)) return 'Série mondiale Apex Legends';
    if (/(rainbow six|r6|siege)/.test(normalized)) return 'Esport Rainbow Six';
    if (/(overwatch|owcs)/.test(normalized)) return 'Série des champions Overwatch';
    if (/(call of duty|cdl|warzone)/.test(normalized)) return 'Ligue Call of Duty';

    return fallbackLeague;
}

function formatKickoffTime(dateValue) {
    if (!dateValue) return 'Heure a confirmer';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Heure a confirmer';

    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function toMysqlDatetime(dateValue) {
    const date = dateValue ? new Date(dateValue) : new Date();
    if (Number.isNaN(date.getTime())) return null;
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function truncate(value = '', max = 180) {
    return String(value).length > max ? `${String(value).slice(0, max - 1)}…` : String(value);
}

/* ==========================================================================
   Persistance : chaque flux RSS/scrape est enregistré dans sa table MySQL.
   - Actualités  -> news
   - Tests       -> notes_gaming
   - Esport      -> live_esport
   INSERT ... ON DUPLICATE KEY UPDATE sur la clé unique (url / href) :
   réexécuté toutes les 24h, ça met à jour au lieu de dupliquer.
   ========================================================================== */

export async function persistNewsItems(items = []) {
    let saved = 0;
    for (const item of items) {
        if (!item.url) continue;
        try {
            await query(
                `INSERT INTO news (source, titre, extrait, url, image, categorie, reading_time, published_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    titre = VALUES(titre), extrait = VALUES(extrait), image = VALUES(image),
                    categorie = VALUES(categorie), reading_time = VALUES(reading_time), updated_at = NOW()`,
                [
                    truncate(item.source || 'Alpha Gaming', 120),
                    truncate(item.title || 'Sans titre', 250),
                    truncate(item.excerpt || '', 500) || null,
                    String(item.url).slice(0, 180),
                    item.image ? String(item.image).slice(0, 180) : null,
                    truncate(item.category || 'Gaming', 78),
                    truncate(item.readingTime || '2 min', 18),
                    toMysqlDatetime(item.publishedAt)
                ]
            );
            saved += 1;
        } catch (error) {
            console.error('persistNewsItems:', error.message);
        }
    }
    return saved;
}

export async function persistTestItems(items = []) {
    // Insertion groupée par lots : indispensable pour persister ~3000 tests sans 3000 requêtes.
    const rows = items
        .filter((item) => item.href)
        .map((item) => {
            const score = item.score == null || item.score === '' ? null : Number.parseFloat(item.score);
            return [
                truncate(item.source || 'Gamekult', 120),
                truncate(item.title || 'Test', 180),
                null,
                String(item.href).slice(0, 180),
                item.image ? String(item.image).slice(0, 180) : null,
                Number.isFinite(score) ? score : null,
                item.platform ? truncate(item.platform, 148) : null,
                toMysqlDatetime(new Date())
            ];
        });

    let saved = 0;
    const CHUNK = 200;
    for (let index = 0; index < rows.length; index += CHUNK) {
        const chunk = rows.slice(index, index + CHUNK);
        const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        try {
            await query(
                `INSERT INTO notes_gaming (source, titre_jeu, extrait, url, image, score, plateformes, published_at)
                 VALUES ${placeholders}
                 ON DUPLICATE KEY UPDATE
                    titre_jeu = VALUES(titre_jeu), image = VALUES(image), score = VALUES(score),
                    plateformes = VALUES(plateformes), updated_at = NOW()`,
                chunk.flat()
            );
            saved += chunk.length;
        } catch (error) {
            console.error('persistTestItems:', error.message);
        }
    }
    return saved;
}

export async function persistEsportItems(items = []) {
    let saved = 0;
    for (const item of items) {
        if (!item.href) continue;
        try {
            await query(
                `INSERT INTO live_esport (source, game, league, match_title, kickoff_time, href, image, status, published_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'upcoming', ?)
                 ON DUPLICATE KEY UPDATE
                    league = VALUES(league), match_title = VALUES(match_title),
                    kickoff_time = VALUES(kickoff_time), updated_at = NOW()`,
                [
                    truncate(item.source || 'Esport', 120),
                    item.game ? truncate(item.game, 78) : null,
                    truncate(item.league || 'Esport', 118),
                    truncate(item.match || item.title || 'Match', 180),
                    toMysqlDatetime(item.publishedAt),
                    String(item.href).slice(0, 180),
                    item.image ? String(item.image).slice(0, 180) : null,
                    toMysqlDatetime(item.publishedAt)
                ]
            );
            saved += 1;
        } catch (error) {
            console.error('persistEsportItems:', error.message);
        }
    }
    return saved;
}

function extractTeams(matchTitle = '') {
    const cleaned = matchTitle
        .replace(/\[[^\]]+\]/g, ' ')
        .replace(/\([^\)]+\)/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!cleaned) return [];

    const splitters = [
        /\s+vs\.?\s+/i,
        /\s+v\.?\s+/i,
        /\s+contre\s+/i,
        /\s+against\s+/i,
        /\s+at\s+/i
    ];

    for (const splitter of splitters) {
        if (splitter.test(cleaned)) {
            const parts = cleaned.split(splitter).map((part) => part.trim()).filter(Boolean);
            if (parts.length >= 2) {
                return parts.slice(0, 2);
            }
        }
    }

    return [];
}

function normalizeTeamName(team = '') {
    return team
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseCsvParam(value) {
    if (!value || typeof value !== 'string') return [];

    return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
}

function diversifyByTeams(matches = [], maxPerTeam = 2) {
    const selected = [];
    const teamUsage = new Map();

    for (const item of matches) {
        const teams = (item.teams || []).map(normalizeTeamName).filter(Boolean);

        if (teams.length === 0) {
            selected.push(item);
            continue;
        }

        const canInclude = teams.every((team) => (teamUsage.get(team) || 0) < maxPerTeam);
        if (!canInclude) continue;

        selected.push(item);
        teams.forEach((team) => {
            teamUsage.set(team, (teamUsage.get(team) || 0) + 1);
        });
    }

    return selected;
}

function diversifyBySource(matches = [], maxPerSource = 4) {
    const selected = [];
    const sourceUsage = new Map();

    for (const item of matches) {
        const source = item.source || 'Unknown';
        const currentCount = sourceUsage.get(source) || 0;

        if (currentCount >= maxPerSource) continue;

        selected.push(item);
        sourceUsage.set(source, currentCount + 1);
    }

    return selected;
}

async function enrichNewsImages(items = []) {
    if (!items.some((item) => !item.image)) return items;

    const feedResults = await Promise.allSettled(
        FEEDS.map(async ({ url, source }) => {
            const feed = await parser.parseURL(url);
            return { source, items: feed.items || [] };
        })
    );
    const rssByUrl = new Map();
    const rssByTitle = new Map();

    feedResults
        .filter((result) => result.status === 'fulfilled')
        .flatMap((result) => result.value.items.map((item) => ({
            url: item.link || null,
            title: cleanTitle(item.title || ''),
            image: extractImage(item)
        })))
        .filter((item) => item.image)
        .forEach((item) => {
            if (item.url) rssByUrl.set(item.url, item.image);
            if (item.title) rssByTitle.set(item.title.toLowerCase(), item.image);
        });

    return items.map((item) => ({
        ...item,
        image: item.image
            || rssByUrl.get(item.url)
            || rssByTitle.get(cleanTitle(item.title).toLowerCase())
            || null
    }));
}

async function getTableLastUpdate(table) {
    try {
        const rows = await query(`SELECT MAX(COALESCE(updated_at, created_at)) AS lastUpdate FROM \`${table}\``);
        return rows[0]?.lastUpdate || null;
    } catch {
        return null;
    }
}

function isFresh(lastUpdate) {
    return Boolean(lastUpdate) && (Date.now() - new Date(lastUpdate).getTime()) < STALE_AFTER_MS;
}

async function getNewsFromDatabase(limit) {
    const rows = await query(
        `SELECT
            source,
            titre AS title,
            extrait AS excerpt,
            url,
            image,
            categorie AS category,
            reading_time AS readingTime,
            published_at AS publishedAt
         FROM news
         ORDER BY COALESCE(published_at, created_at) DESC, id DESC
         LIMIT ${limit}`
    );    return rows.map((row) => ({
        ...row,
        image: row.image || null,
        excerpt: row.excerpt || 'Résumé indisponible.'
    }));
}

async function getEsportFromDatabase(limit, leagueFilters, excludedTeams) {
    const conditions = [];
    const params = [];

    if (leagueFilters.length > 0) {
        conditions.push(`LOWER(league) IN (${leagueFilters.map(() => '?').join(', ')})`);
        params.push(...leagueFilters);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await query(
        `SELECT
            league,
            match_title AS \`match\`,
            kickoff_time AS time,
            href,
            source,
            published_at AS publishedAt,
            status
         FROM live_esport
         ${whereClause}
         ORDER BY COALESCE(published_at, created_at) DESC, id DESC
         LIMIT ${limit}`,
        params
    );

    return rows
        .map((row) => ({
            ...row,
            // Formatage HH:MM depuis le datetime SQL (le flux RSS renvoie déjà ce format).
            time: row.time
                ? new Date(row.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : 'Heure a confirmer'
        }))
        .filter((item) => {
        if (excludedTeams.length === 0) return true;
        const normalizedMatch = normalizeTeamName(item.match || '');
        return !excludedTeams.some((excluded) => normalizedMatch.includes(excluded));
    });
}

async function fetchHtml(url, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        const follow = redirectCount < 5;
        const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' } }, (response) => {
            // Suivre les redirections (ex: /tests.html sans paramètre -> trailing slash)
            if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
                response.resume();
                if (!follow) {
                    reject(new Error('Trop de redirections'));
                    return;
                }
                const nextUrl = new URL(response.headers.location, url).toString();
                return resolve(fetchHtml(nextUrl, redirectCount + 1));
            }

            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            let data = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => { data += chunk; });
            response.on('end', () => resolve(data));
        });
        request.on('error', reject);
        request.setTimeout(9000, () => request.destroy(new Error('Timeout')));
    });
}

function scrapeGamekultTests(html = '') {
    const cardPattern = /<article class="ed__review-h__mdb[\s\S]*?<\/article>/g;
    const cards = html.match(cardPattern) || [];

    return cards.map((card) => {
        const noteMatch = card.match(/data-note="(\d+)/);
        const linkMatch = card.match(/href="([^"]*\/test\.html)/);
        const titleMatch = card.match(/<h2[^>]*>[\s\S]*?<a[^>]*href="[^"]*"[^>]*>([\s\S]*?)<\/a>/);
        const imageMatch = card.match(/data-src="([^"]+)/);
        const platformMatch = card.match(/pr__platform__tag--link[\s\S]*?<span>([^<]+)<\/span>/i);

        return ({
            title: titleMatch ? stripHtml(titleMatch[1]) : null,
            href: linkMatch ? `https://www.gamekult.com${linkMatch[1].replace(/&amp;/g, '&')}` : null,
            image: imageMatch ? `https:${imageMatch[1]}` : null,
            score: noteMatch ? noteMatch[1] : null,
            platform: platformMatch ? stripHtml(platformMatch[1]) : null,
            source: 'Gamekult'
        });
    }).filter((item) => item.title && item.href);
}

function slugify(value = '') {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function matchGameToCatalog(tests = [], catalogTitles = []) {
    const catalogSlugs = catalogTitles.map((title) => slugify(title)).filter(Boolean);

    return tests.map((test) => {
        const normalized = slugify(test.title || '');
        const matched = catalogSlugs.find((slug) =>
            slug.length > 3 && (normalized.includes(slug) || slug.includes(normalized))
        );
        return { ...test, inCatalog: Boolean(matched) };
    });
}

// Nombre de pages de tests Gamekult à couvrir (souhait utilisateur : ~430 pages).
const GAMEKULT_MAX_PAGES = 430;
const GAMEKULT_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 heures

let gamekultCache = {
    at: 0,
    items: [],
    pages: 0
};

function scrapePage(items, html) {
    const scraped = scrapeGamekultTests(html);
    const seen = new Set(items.map((item) => item.href));
    scraped.forEach((item) => {
        if (item.href && !seen.has(item.href)) {
            seen.add(item.href);
            items.push(item);
        }
    });
}

async function fetchGamekultTests(maxPages = GAMEKULT_MAX_PAGES) {
    const now = Date.now();
    if (gamekultCache.items.length > 0 && now - gamekultCache.at < GAMEKULT_CACHE_TTL) {
        return gamekultCache;
    }

    const items = [];
    let lastPageWithContent = 0;

    // Récupérer en parallèle par lots de 8 pages pour ne pas saturer le site.
    const CONCURRENCY = 8;
    let page = 1;
    while (page <= maxPages) {
        const batch = [];
        for (let i = 0; i < CONCURRENCY && page <= maxPages; i += 1, page += 1) {
            const pageUrl = page === 1 ? GAMEKULT_TESTS_URL : `${GAMEKULT_TESTS_URL}?page=${page}`;
            batch.push(fetchHtml(pageUrl).then((html) => ({ page, html })).catch(() => ({ page, html: null })));
        }

        const results = await Promise.all(batch);
        const sortedResults = results
            .filter((result) => result.html)
            .sort((a, b) => a.page - b.page);

        let batchHadContent = false;
        sortedResults.forEach(({ page: currentPage, html }) => {
            const before = items.length;
            scrapePage(items, html);
            if (items.length > before) {
                batchHadContent = true;
                lastPageWithContent = currentPage;
            }
        });

        // Si un lot entier est vide, on a probablement atteint la fin de la liste.
        if (!batchHadContent && results.every((result) => !result.html || result.html.indexOf('ed__review-h__mdb') === -1)) {
            break;
        }
    }

    gamekultCache = {
        at: Date.now(),
        items,
        pages: lastPageWithContent
    };
    return gamekultCache;
}export async function getGamekultTests(req, res) {
    const limit = Math.max(1, Math.min(Number.parseInt(req.query.limit, 10) || 20, 20));
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

    try {
        const catalogTitles = await query('SELECT titre_jeu FROM games');
        const titles = catalogTitles.map((row) => row.titre_jeu);

        const { items: allScraped } = await fetchGamekultTests();
        const all = matchGameToCatalog(allScraped, titles);

        const total = all.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const safePage = Math.min(page, totalPages);

        const start = (safePage - 1) * limit;
        const items = all.slice(start, start + limit);

        if (items.length === 0) {
            return res.status(502).json(buildErrorResponse('Aucun test disponible pour le moment', 502));
        }        // Persistance asynchrone de TOUT le catalogue de tests dans notes_gaming (sans bloquer la réponse)
        // mais uniquement si la table est vide ou périmée (> 22h), pour ne pas réinsérer 3000 lignes à chaque visite.
        getTableLastUpdate('notes_gaming')
            .then((lastUpdate) => {
                if (isFresh(lastUpdate)) return;
                persistTestItems(all).then((saved) => {
                    if (saved > 0) console.log(`[notes_gaming] ${saved} tests enregistrés (catalogue complet)`);
                }).catch(() => {});
            })
            .catch(() => {});

        return res.json(buildSuccessResponse({ items, total, page: safePage, limit, totalPages, source: 'gamekult' }));
    } catch (error) {
        console.error('Scraping Gamekult impossible:', error.message);
        return res.status(502).json(buildErrorResponse('Tests Gamekult indisponibles pour le moment', 502));
    }
}

export async function getLatestNews(req, res) {
    const limit = Math.max(1, Math.min(Number.parseInt(req.query.limit, 10) || 9, 50));

    try {
        // Si la table est périmée (> 22h sans mise à jour), on force un rafraîchissement par RSS.
        const lastUpdate = await getTableLastUpdate('news');
        if (!isFresh(lastUpdate)) {
            console.log('[news] table périmée ou vide, rafraîchissement RSS...');
        } else {
            const databaseNews = await getNewsFromDatabase(limit);
            if (databaseNews.length > 0) {
                const enrichedNews = await enrichNewsImages(databaseNews);
                return res.json(buildSuccessResponse({ items: enrichedNews, total: enrichedNews.length, source: 'database' }));
            }
        }
    } catch (error) {
        console.error('News MySQL indisponibles, utilisation du RSS:', error.message);
    }

    try {
        const parsedFeeds = await Promise.allSettled(
            FEEDS.map(async ({ url, source }) => {
                const feed = await parser.parseURL(url);
                return { source, items: feed.items || [] };
            })
        );

        // Persistance : les actualités RSS sont enregistrées dans la table `news`.
        const rssItems = deduplicate(parsedFeeds
            .filter((result) => result.status === 'fulfilled')
            .flatMap((result) => result.value.items.map((item) => ({
                source: result.value.source,
                title: cleanTitle(item.title || 'Alpha Gaming'),
                excerpt: stripHtml(item.contentSnippet || item['content:encoded'] || item.content || '').slice(0, 220) || 'Résumé indisponible.',
                url: item.link || null,
                image: extractImage(item),
                publishedAt: item.isoDate || item.pubDate || null
            })))
            .filter((item) => item.url));
        if (rssItems.length > 0) {
            persistNewsItems(rssItems).then((saved) => {
                if (saved > 0) console.log(`[news] ${saved} actualités enregistrées`);
            }).catch(() => {});
        }

        const news = deduplicate(parsedFeeds
            .filter((result) => result.status === 'fulfilled')
            .flatMap((result) => result.value.items.map((item) => ({
                source: result.value.source,
                title: cleanTitle(item.title || 'Alpha Gaming'),
                excerpt: stripHtml(item.contentSnippet || item['content:encoded'] || item.content || '').slice(0, 220) || 'Résumé indisponible.',
                url: item.link || null,
                image: extractImage(item),
                publishedAt: item.isoDate || item.pubDate || null
            })))
            .filter((item) => item.url)
            .map((item) => ({
                ...item,
                category: inferCategory(item.title),
                readingTime: estimateReadingTime(item.excerpt)
            }))
            .sort((a, b) => {
                const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                return bDate - aDate;
            })
            .slice(0, limit));

        if (news.length === 0) {
            return res.status(502).json(buildErrorResponse('Aucune actu disponible pour le moment', 502));
        }

        return res.json(buildSuccessResponse({ items: news, total: news.length }));
    } catch {
        return res.status(502).json(buildErrorResponse('Aucune actu disponible pour le moment', 502));
    }
}

export async function getLatestEsport(req, res) {
    const limit = Math.max(1, Math.min(Number.parseInt(req.query.limit, 10) || 10, 20));
    const leagueFilters = parseCsvParam(req.query.league).map((value) => value.toLowerCase());
    const excludedTeams = parseCsvParam(req.query.excludeTeam).map((value) => normalizeTeamName(value));

    try {
        // Fraîcheur d'abord : si la table a été mise à jour il y a moins de 22h, on sert MySQL.
        const lastUpdate = await getTableLastUpdate('live_esport');
        if (isFresh(lastUpdate)) {
            const databaseMatches = await getEsportFromDatabase(limit, leagueFilters, excludedTeams);
            if (databaseMatches.length > 0) {
                return res.json(buildSuccessResponse({ items: databaseMatches, total: databaseMatches.length, source: 'database' }));
            }
        } else {
            console.log('[live_esport] table périmée ou vide, rafraîchissement RSS...');
        }
    } catch (error) {
        console.error('Esport MySQL indisponible, utilisation du RSS:', error.message);
    }

    try {
        const parsedFeeds = await Promise.allSettled(
            ESPORT_FEEDS.map(async ({ url, source, league }) => {
                const feed = await parser.parseURL(url);
                return { source, league, items: feed.items || [] };
            })
        );

        const matches = parsedFeeds
            .filter((result) => result.status === 'fulfilled')
            .flatMap((result) => result.value.items.map((item) => {
                const title = item.title || 'Match esport';
                const teams = extractTeams(title);

                return {
                    league: inferLeague(title, result.value.league || result.value.source),
                    match: title,
                    teams,
                    time: formatKickoffTime(item.isoDate || item.pubDate),
                    href: item.link || null,
                    source: result.value.source,
                    publishedAt: item.isoDate || item.pubDate || null,
                    external: true,
                    game: null,
                    image: extractImage(item)
                };
            }))
            .filter((item) => item.href)
            .filter((item) => leagueFilters.length === 0 || leagueFilters.includes((item.league || '').toLowerCase()))
            .filter((item) => {
                if (excludedTeams.length === 0) return true;
                const teams = (item.teams || []).map(normalizeTeamName);
                const titleNormalized = normalizeTeamName(item.match || '');
                return !excludedTeams.some((excluded) => teams.includes(excluded) || titleNormalized.includes(excluded));
            });

        // Tri décroissant par date de publication.
        matches.sort((a, b) => {
            const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return bDate - aDate;
        });

        // Persistance : les événements esport RSS sont enregistrés dans la table `live_esport`.
        if (matches.length > 0) {
            persistEsportItems(matches).then((saved) => {
                if (saved > 0) console.log(`[live_esport] ${saved} événements enregistrés`);
            }).catch(() => {});
        }

        const sourceDiversified = diversifyBySource(matches, 4);
        const teamDiversified = diversifyByTeams(sourceDiversified, 2);
        const baseMatches = teamDiversified.length >= Math.min(limit, 5) ? teamDiversified : sourceDiversified;
        const finalMatches = baseMatches.slice(0, limit).map(({ teams, ...rest }) => rest);

        if (finalMatches.length === 0) {
            return res.status(502).json(buildErrorResponse('Aucun live esport disponible pour le moment', 502));
        }

        return res.json(buildSuccessResponse({ items: finalMatches, total: finalMatches.length }));
    } catch {
        return res.status(502).json(buildErrorResponse('Aucun live esport disponible pour le moment', 502));
    }
}

export async function getLatestNotes(req, res) {
    const limit = Math.max(1, Math.min(Number.parseInt(req.query.limit, 10) || 20, 50));
    try {
        const lastUpdate = await getTableLastUpdate('notes_gaming');
        if (isFresh(lastUpdate)) {
            const items = await query(`SELECT titre_jeu AS game, score, plateformes AS platform, verdict, url AS href, image, published_at AS publishedAt FROM notes_gaming ORDER BY COALESCE(published_at, created_at) DESC, id DESC LIMIT ${limit}`);
            if (items.length > 0) {
                return res.json(buildSuccessResponse({ items, total: items.length, source: 'database' }));
            }
        }
        // Table vide ou périmée : on sert le scraping Gamekult (qui re-persiste en arrière-plan).
        const cache = await fetchGamekultTests();
        const items = cache.items.slice(0, limit);
        return res.json(buildSuccessResponse({ items, total: items.length, source: 'gamekult' }));
    } catch {
        return res.status(500).json(buildErrorResponse('Aucune note disponible pour le moment', 500));
    }
}

export async function getLatestQuickTests(req, res) {
    const limit = Number.parseInt(req.query.limit, 10) || 9;
    const boundedLimit = Math.max(1, Math.min(limit, 20));

    try {
        const items = await query(
            `SELECT
                titre_jeu AS game,
                score,
                plateformes AS platform,
                verdict,
                url AS href,
                image,
                created_at AS testedAt
             FROM notes_gaming
             ORDER BY created_at DESC, id DESC
             LIMIT ${boundedLimit}`
        );

        return res.json(buildSuccessResponse({ items, total: items.length }));
    } catch {
        return res.status(500).json(buildErrorResponse('Erreur lors de la recuperation des tests rapides', 500));
    }
}

import Parser from 'rss-parser';
import { query } from '../config/db.js';
import { buildErrorResponse, buildSuccessResponse } from '../utils/response.js';

const parser = new Parser({
    timeout: 9000,
    customFields: {
        item: ['content:encoded', 'media:content', 'media:thumbnail', 'media:group']
    }
});

const FEEDS = [
    { url: 'https://www.actugaming.net/feed/', source: 'ActuGaming.net' },
    { url: 'https://www.jeuxvideo.com/rss/rss.xml', source: 'JeuxVideo.com' }
];

const NOTES_FEEDS = [
    { url: 'https://www.actugaming.net/tests/feed/', source: 'ActuGaming.net' },
    { url: 'https://www.jeuxvideo.com/rss/rss.xml', source: 'JeuxVideo.com' }
];

const ESPORT_FEEDS = [
    { url: 'https://www.hltv.org/rss/news', source: 'HLTV', league: 'CS2' },
    { url: 'https://www.vlr.gg/rss', source: 'VLR', league: 'VALORANT' },
    { url: 'https://esports.gg/feed/', source: 'Esports.gg', league: 'Esport' },
    { url: 'https://dotesports.com/feed', source: 'Dot Esports', league: 'Esport' }
];



function stripHtml(input = '') {
    return String(input || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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

function appendCuratedIfNotDiverse(matches = [], limit = 10) {
    const existingLeagues = new Set(matches.map((item) => item.league).filter(Boolean));
    const needsMoreVariety = existingLeagues.size < 3;

    if (!needsMoreVariety) {
        return matches.slice(0, limit);
    }

    const existingMatchKeys = new Set(matches.map((item) => `${item.league}::${item.match}`));
    const nowIso = new Date().toISOString();

    const curatedToAdd = CURATED_ESPORT_FALLBACK
        .filter((item) => !existingMatchKeys.has(`${item.league}::${item.match}`))
        .map((item) => ({
            ...item,
            time: 'Heure a confirmer',
            publishedAt: nowIso
        }));

    return [...matches, ...curatedToAdd].slice(0, limit);
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
            match_title AS match,
            kickoff_time AS time,
            href,
            source,
            published_at AS publishedAt,
            is_external AS external
         FROM live_esport
         ${whereClause}
         ORDER BY COALESCE(published_at, created_at) DESC, id DESC
         LIMIT ${limit}`,
        params
    );

    return rows.filter((item) => {
        if (excludedTeams.length === 0) return true;
        const normalizedMatch = normalizeTeamName(item.match || '');
        return !excludedTeams.some((excluded) => normalizedMatch.includes(excluded));
    });
}

export async function getLatestNews(req, res) {
    const limit = Math.max(1, Math.min(Number.parseInt(req.query.limit, 10) || 9, 50));

    try {
        const databaseNews = await getNewsFromDatabase(limit);
        if (databaseNews.length > 0) {
            const enrichedNews = await enrichNewsImages(databaseNews);
            return res.json(buildSuccessResponse({ items: enrichedNews, total: enrichedNews.length, source: 'database' }));
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
        const databaseMatches = await getEsportFromDatabase(limit, leagueFilters, excludedTeams);
        if (databaseMatches.length > 0) {
            return res.json(buildSuccessResponse({ items: databaseMatches, total: databaseMatches.length, source: 'database' }));
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
                    external: true
                };
            }))
            .filter((item) => item.href)
            .filter((item) => leagueFilters.length === 0 || leagueFilters.includes((item.league || '').toLowerCase()))
            .filter((item) => {
                if (excludedTeams.length === 0) return true;
                const teams = (item.teams || []).map(normalizeTeamName);
                const titleNormalized = normalizeTeamName(item.match || '');
                return !excludedTeams.some((excluded) => teams.includes(excluded) || titleNormalized.includes(excluded));
            })
            .sort((a, b) => {
                const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                return bDate - aDate;
            });

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
        const items = await query(`SELECT titre_jeu AS game, score, plateformes AS platform, verdict, lien AS href, is_external AS external, published_at AS publishedAt FROM notes_gaming ORDER BY COALESCE(published_at, created_at) DESC, id DESC LIMIT ${limit}`);
        return res.json(buildSuccessResponse({ items, total: items.length, source: 'database' }));
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
                lien AS href,
                is_external AS external,
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

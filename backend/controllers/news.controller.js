import Parser from 'rss-parser';
import { query } from '../config/db.js';
import { buildErrorResponse, buildSuccessResponse } from '../utils/response.js';

const parser = new Parser({
    timeout: 9000,
    customFields: {
        item: ['content:encoded']
    }
});

const FEEDS = [
    { url: 'https://www.actugaming.net/feed/', source: 'ActuGaming.net' },
    { url: 'https://www.jeuxvideo.com/rss/rss.xml', source: 'JeuxVideo.com' }
];

const ESPORT_FEEDS = [
    { url: 'https://www.hltv.org/rss/news', source: 'HLTV', league: 'CS2' },
    { url: 'https://www.vlr.gg/rss', source: 'VLR', league: 'VALORANT' },
    { url: 'https://esports.gg/feed/', source: 'Esports.gg', league: 'Esport' },
    { url: 'https://dotesports.com/feed', source: 'Dot Esports', league: 'Esport' }
];

const CURATED_ESPORT_FALLBACK = [
    { league: 'League européenne de LoL', match: 'G2 vs Fnatic', href: 'https://lolesports.com/', source: 'Curated', external: true },
    { league: 'Tour des champions VALORANT', match: 'Team Heretics vs Natus Vincere', href: 'https://valorantesports.com/', source: 'Curated', external: true },
    { league: 'Majeur CS2', match: 'NAVI vs FaZe', href: 'https://www.hltv.org/', source: 'Curated', external: true },
    { league: 'Majeur Rocket League', match: 'Vitality vs BDS', href: 'https://esports.rocketleague.com/', source: 'Curated', external: true },
    { league: 'Circuit pro Dota 2', match: 'Team Spirit vs Gaimin Gladiators', href: 'https://www.dota2.com/esports', source: 'Curated', external: true },
    { league: 'Série mondiale Apex Legends', match: 'TSM vs Alliance', href: 'https://www.ea.com/games/apex-legends/compete', source: 'Curated', external: true }
];

function stripHtml(input = '') {
    return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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

export async function getLatestNews(req, res) {
    const limit = Number.parseInt(req.query.limit, 10) || 9;

    try {
        const parsedFeeds = await Promise.allSettled(
            FEEDS.map(async ({ url, source }) => {
                const feed = await parser.parseURL(url);
                return { source, items: feed.items || [] };
            })
        );

        const news = parsedFeeds
            .filter((result) => result.status === 'fulfilled')
            .flatMap((result) => result.value.items.map((item) => ({
                source: result.value.source,
                title: item.title || 'Alpha Gaming',
                excerpt: stripHtml(item.contentSnippet || item['content:encoded'] || item.content || '').slice(0, 220) || 'Resume indisponible.',
                url: item.link || null,
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
            .slice(0, Math.max(1, Math.min(limit, 20)));

        if (news.length === 0) {
            return res.status(502).json(buildErrorResponse('Aucune actu disponible pour le moment', 502));
        }

        return res.json(buildSuccessResponse({ items: news, total: news.length }));
    } catch (error) {
        return res.status(500).json(buildErrorResponse('Erreur lors de la recuperation des news', 500));
    }
}

export async function getLatestEsport(req, res) {
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const leagueFilters = parseCsvParam(req.query.league).map((value) => value.toLowerCase());
    const excludedTeams = parseCsvParam(req.query.excludeTeam).map((value) => normalizeTeamName(value));

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
            .filter((item) => {
                if (leagueFilters.length === 0) return true;
                return leagueFilters.includes((item.league || '').toLowerCase());
            })
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

        const boundedLimit = Math.max(1, Math.min(limit, 20));
        const sourceDiversified = diversifyBySource(matches, 4);
        const teamDiversified = diversifyByTeams(sourceDiversified, 2);
        const baseMatches = (teamDiversified.length >= Math.min(boundedLimit, 5) ? teamDiversified : sourceDiversified);
        const finalMatches = appendCuratedIfNotDiverse(baseMatches, boundedLimit)
            .map(({ teams, ...rest }) => rest);

        if (finalMatches.length === 0) {
            return res.status(502).json(buildErrorResponse('Aucun live esport disponible pour le moment', 502));
        }

        return res.json(buildSuccessResponse({ items: finalMatches, total: finalMatches.length }));
    } catch {
        return res.status(500).json(buildErrorResponse('Erreur lors de la recuperation du live esport', 500));
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
                is_external AS external
             FROM tests_rapides
             ORDER BY created_at DESC, id DESC
             LIMIT ?`,
            [boundedLimit]
        );

        return res.json(buildSuccessResponse({ items, total: items.length }));
    } catch {
        return res.status(500).json(buildErrorResponse('Erreur lors de la recuperation des tests rapides', 500));
    }
}

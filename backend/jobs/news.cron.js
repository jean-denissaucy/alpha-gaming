// jobs/news.cron.js
// Synchronisation quotidienne des flux RSS/scraping vers les tables MySQL.
// Appelé par node-cron dans server.js — pas besoin de curl ni d'appel HTTP externe.

import Parser from 'rss-parser';
import { query } from '../config/db.js';
import { persistNewsItems, persistTestItems, persistEsportItems } from '../controllers/news.controller.js';

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

// ---- Helpers de nettoyage (copiés depuis le contrôleur) ----

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

function cleanTitle(title = '') {
    return stripHtml(title).replace(/\s+/g, ' ').trim();
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
    return `${Math.max(2, Math.round(words / 180))} min`;
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

function extractTeams(matchTitle = '') {
    const cleaned = matchTitle
        .replace(/\[[^\]]+\]/g, ' ')
        .replace(/\([^\)]+\)/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!cleaned) return [];
    const splitters = [/\s+vs\.?\s+/i, /\s+v\.?\s+/i, /\s+contre\s+/i, /\s+against\s+/i, /\s+at\s+/i];
    for (const splitter of splitters) {
        if (splitter.test(cleaned)) {
            const parts = cleaned.split(splitter).map((part) => part.trim()).filter(Boolean);
            if (parts.length >= 2) return parts.slice(0, 2);
        }
    }
    return [];
}

function deduplicate(items = []) {
    const seen = new Set();
    return items.filter((item) => {
        const key = item.url || item.href || `${item.source}:${item.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ---- Fonctions de sync ----

export async function syncNews() {
    const parsedFeeds = await Promise.allSettled(
        FEEDS.map(async ({ url, source }) => {
            const feed = await parser.parseURL(url);
            return { source, items: feed.items || [] };
        })
    );

    const items = deduplicate(parsedFeeds
        .filter((result) => result.status === 'fulfilled')
        .flatMap((result) => result.value.items.map((item) => ({
            source: result.value.source,
            title: cleanTitle(item.title || 'Alpha Gaming'),
            excerpt: stripHtml(item.contentSnippet || item['content:encoded'] || item.content || '').slice(0, 220) || 'Résumé indisponible.',
            url: item.link || null,
            image: extractImage(item),
            publishedAt: item.isoDate || item.pubDate || null,
            category: inferCategory(cleanTitle(item.title || '')),
            readingTime: estimateReadingTime(stripHtml(item.contentSnippet || item.content || ''))
        })))
        .filter((item) => item.url));

    return persistNewsItems(items);
}

export async function syncEsport() {
    const parsedFeeds = await Promise.allSettled(
        ESPORT_FEEDS.map(async ({ url, source, league }) => {
            const feed = await parser.parseURL(url);
            return { source, league, items: feed.items || [] };
        })
    );

    const items = deduplicate(parsedFeeds
        .filter((result) => result.status === 'fulfilled')
        .flatMap((result) => result.value.items.map((item) => {
            const title = item.title || 'Match esport';
            const teams = extractTeams(title);
            return {
                league: inferLeague(title, result.value.league || result.value.source),
                match: title,
                href: item.link || null,
                source: result.value.source,
                publishedAt: item.isoDate || item.pubDate || null,
                image: extractImage(item)
            };
        }))
        .filter((item) => item.href));

    return persistEsportItems(items);
}

export async function syncTests(maxPages = 430) {
    // Résultat du contrôleur : on le rappelle pour profiter du cache Gamekult déjà en place.
    const { getGamekultTests } = await import('../controllers/news.controller.js');
    // Le handler est une fonction express (req, res) — on l'appelle avec un mock pour déclencher la persistance.
    const mockRes = {
        json: (payload) => ({ payload }),
        status: () => mockRes,
        send: () => mockRes
    };
    const mockReq = { query: { page: '1', limit: '20' } };
    await getGamekultTests(mockReq, mockRes);
    return { ok: true };
}

export async function runAllSync() {
    const report = { news: 0, esport: 0, tests: false, errors: [] };

    try {
        report.news = await syncNews();
        console.log(`[cron] news: ${report.news} enregistrées`);
    } catch (error) {
        console.error('[cron] news en erreur:', error.message);
        report.errors.push(`news: ${error.message}`);
    }

    try {
        report.esport = await syncEsport();
        console.log(`[cron] esport: ${report.esport} enregistrés`);
    } catch (error) {
        console.error('[cron] esport en erreur:', error.message);
        report.errors.push(`esport: ${error.message}`);
    }

    try {
        await syncTests();
        report.tests = true;
        console.log('[cron] tests: catalogue synchronisé');
    } catch (error) {
        console.error('[cron] tests en erreur:', error.message);
        report.errors.push(`tests: ${error.message}`);
    }

    return report;
}

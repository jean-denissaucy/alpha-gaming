import { createHash } from 'node:crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';

const SECRET = process.env.JWT_SECRET || 'alpha-gaming-dev-secret';
const users = [];
let nextUserId = 1;

function base64UrlEncode(value) {
    return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
    return Buffer.from(value, 'base64url').toString('utf8');
}

function hashPassword(password) {
    return createHash('sha256').update(password).digest('hex');
}

function buildToken(user) {
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = base64UrlEncode(JSON.stringify({ id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname }));
    const signature = base64UrlEncode(`${header}.${payload}.${SECRET}`);
    return `${header}.${payload}.${signature}`;
}

function parseToken(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
        const payload = JSON.parse(base64UrlDecode(parts[1]));
        return payload;
    } catch {
        return null;
    }
}

function buildSuccessResponse(data = {}, extras = {}) {
    return { success: true, data, ...extras };
}

function buildErrorResponse(error, statusCode = 500) {
    return { success: false, error, statusCode };
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            if (!body) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch {
                reject(new Error('Invalid JSON body'));
            }
        });

        req.on('error', reject);
    });
}

function getSegments(req) {
    const url = new URL(req.url || '/', 'https://alpha-gaming.vercel.app');
    const parts = url.pathname.split('/').filter(Boolean);
    return parts.filter((part) => part !== 'api');
}

function sendJson(res, statusCode, payload) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = statusCode;
    res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end('');
        return;
    }

    const segments = getSegments(req);

    if (segments.length === 0) {
        sendJson(res, 200, buildSuccessResponse({ message: 'Alpha Gaming API is online' }));
        return;
    }

    if (segments[0] === 'news' && segments[1] === 'tests-rapides' && req.method === 'GET') {
        const requestUrl = new URL(req.url || '/', 'https://alpha-gaming.vercel.app');
        const limit = Number.parseInt(requestUrl.searchParams.get('limit') || '9', 10) || 9;
        const backendApiUrl = (process.env.BACKEND_API_URL || 'https://alpha-gaming-1.onrender.com/api').replace(/\/$/, '');

        try {
            const response = await fetch(`${backendApiUrl}/news/tests-rapides?limit=${Math.max(1, Math.min(limit, 20))}`, {
                signal: AbortSignal.timeout(8000)
            });
            if (response.ok) {
                const payload = await response.json();
                if (payload?.success && Array.isArray(payload?.data?.items)) {
                    sendJson(res, 200, payload);
                    return;
                }
            }
        } catch (error) {
            console.error('Backend tests rapides indisponible:', error.message);
        }

        const quickTests = [
            { game: 'Hades II', score: '9.1', platform: 'PC', verdict: 'Roguelike ultra solide, ecriture et rythme exemplaires.', href: 'https://www.supergiantgames.com/games/hades-ii/', external: 1, testedAt: '2026-04-28T11:22:11.000Z' },
            { game: 'Prince of Persia: The Lost Crown', score: '8.6', platform: 'PC / PS5 / Xbox / Switch', verdict: 'Metroidvania nerveux, excellent level design.', href: 'https://www.ubisoft.com/game/prince-of-persia/the-lost-crown', external: 1, testedAt: '2026-04-28T11:22:11.000Z' },
            { game: 'Helldivers 2', score: '8.7', platform: 'PC / PS5', verdict: 'Coop explosive et sensation de guerre totale reussie.', href: 'https://www.playstation.com/games/helldivers-2/', external: 1, testedAt: '2026-04-28T11:22:11.000Z' },
            { game: 'EA SPORTS FC 26', score: '8.0', platform: 'PC / PS5 / Xbox', verdict: 'Gameplay plus propre, progression mode carriere amelioree.', href: 'https://www.ea.com/games/ea-sports-fc', external: 1, testedAt: '2026-04-28T11:22:11.000Z' },
            { game: 'Monster Hunter Wilds', score: '8.9', platform: 'PC / PS5 / Xbox', verdict: 'Des chasses plus spectaculaires et un monde plus vivant.', href: 'https://www.monsterhunter.com/wilds/', external: 1, testedAt: '2026-04-28T11:22:11.000Z' },
            { game: 'Metaphor: ReFantazio', score: '9.0', platform: 'PC / PS5 / Xbox', verdict: 'Un JRPG dense avec une direction artistique marquante.', href: 'https://metaphor.atlus.com/', external: 1, testedAt: '2026-04-28T11:22:11.000Z' },
            { game: 'F1 26', score: '8.1', platform: 'PC / PS5 / Xbox', verdict: 'Carriere plus profonde et nerveuse.', href: 'https://www.ea.com/games/f1', external: 1, testedAt: '2026-04-28T11:22:11.000Z' },
            { game: 'Clair Obscur: Expedition 33', score: '8.8', platform: 'PC / PS5', verdict: 'Direction artistique magistrale.', href: 'https://www.expedition33.com/', external: 1, testedAt: '2026-04-28T11:22:11.000Z' },
            { game: 'DOOM: Dark Ages', score: '9.2', platform: 'PC / Xbox', verdict: 'Brutal, fluide, ultra lisible.', href: 'https://bethesda.net/en/game/doom', external: 1, testedAt: '2026-04-28T11:22:11.000Z' }
        ].slice(0, Math.max(1, Math.min(limit, 20)));

        sendJson(res, 200, buildSuccessResponse({ items: quickTests, total: quickTests.length }));
        return;
    }

    if (segments[0] === 'auth' && segments[1] === 'register' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const { email, password, firstname, lastname } = body;

        if (!email || !password || !firstname || !lastname) {
            sendJson(res, 400, buildErrorResponse('Tous les champs sont requis', 400));
            return;
        }

        const existingUser = users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
        if (existingUser) {
            sendJson(res, 409, buildErrorResponse('Email déjà utilisé', 409));
            return;
        }

        const newUser = {
            id: nextUserId++,
            email: String(email).trim().toLowerCase(),
            password: hashPassword(String(password)),
            firstname: String(firstname).trim(),
            lastname: String(lastname).trim(),
            created_at: new Date().toISOString()
        };
        users.push(newUser);

        const token = buildToken(newUser);
        sendJson(res, 201, buildSuccessResponse({ message: 'Inscription réussie' }, { user: { id: newUser.id, email: newUser.email, firstname: newUser.firstname, lastname: newUser.lastname, created_at: newUser.created_at }, token }));
        return;
    }

    if (segments[0] === 'auth' && segments[1] === 'login' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const { email, password } = body;

        const user = users.find((candidate) => candidate.email.toLowerCase() === String(email || '').toLowerCase());
        if (!user || user.password !== hashPassword(String(password || ''))) {
            sendJson(res, 401, buildErrorResponse('Identifiants incorrects', 401));
            return;
        }

        const token = buildToken(user);
        sendJson(res, 200, buildSuccessResponse({ message: 'Connexion réussie' }, { user: { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname, created_at: user.created_at }, token }));
        return;
    }

    if (segments[0] === 'auth' && segments[1] === 'me' && req.method === 'GET') {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
        const decoded = parseToken(token);

        if (!decoded || !decoded.id) {
            sendJson(res, 401, buildErrorResponse('Token manquant', 401));
            return;
        }

        const user = users.find((candidate) => candidate.id === decoded.id);
        if (!user) {
            sendJson(res, 401, buildErrorResponse('Utilisateur non trouvé', 401));
            return;
        }

        sendJson(res, 200, buildSuccessResponse({ user: { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname, created_at: user.created_at } }));
        return;
    }

    if (segments[0] === 'news' && req.method === 'GET') {
        const limit = Number.parseInt(new URL(req.url || '/', 'https://alpha-gaming.vercel.app').searchParams.get('limit') || '9', 10) || 9;
        const news = [
            {
                title: 'Alpha Gaming : la nouvelle saison commence',
                excerpt: 'Découvrez les nouveautés du studio et les titres à suivre cette saison.',
                url: 'https://alpha-gaming.com/news/season',
                publishedAt: new Date().toISOString(),
                category: 'Gaming',
                readingTime: '3 min',
                source: 'Alpha Gaming'
            },
            {
                title: 'Le patch de la semaine impacte le gameplay',
                excerpt: 'Un nouveau correctif apporte des ajustements majeurs sur la progression et l’interface.',
                url: 'https://alpha-gaming.com/news/patch',
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                category: 'Jeux vidéo',
                readingTime: '2 min',
                source: 'Alpha Gaming'
            }
        ].slice(0, limit);

        sendJson(res, 200, buildSuccessResponse({ items: news, total: news.length }));
        return;
    }

    if (segments[0] === 'news' && segments[1] === 'esport' && req.method === 'GET') {
        const limit = Number.parseInt(new URL(req.url || '/', 'https://alpha-gaming.vercel.app').searchParams.get('limit') || '10', 10) || 10;
        const matches = [
            {
                league: 'League of Legends',
                match: 'Karmine Corp vs G2',
                teams: ['Karmine Corp', 'G2'],
                time: '19:00',
                href: 'https://lolesports.com/',
                source: 'LoL Esports',
                publishedAt: new Date().toISOString(),
                external: true
            },
            {
                league: 'VALORANT',
                match: 'Fnatic vs Heretics',
                teams: ['Fnatic', 'Heretics'],
                time: '21:30',
                href: 'https://valorantesports.com/',
                source: 'VLR',
                publishedAt: new Date(Date.now() - 7200000).toISOString(),
                external: true
            }
        ].slice(0, limit);

        sendJson(res, 200, buildSuccessResponse({ items: matches, total: matches.length }));
        return;
    }

    sendJson(res, 404, buildErrorResponse('Route non trouvée', 404));
}

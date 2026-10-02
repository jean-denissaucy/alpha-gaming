const RENDER_API_URL = 'https://alpha-gaming-1.onrender.com/api';

// Détermine l'URL backend à utiliser selon la configuration locale ou la production.
export function resolveApiBaseUrl(env = {}, location = {}) {
    const hostname = (location.hostname || '').toLowerCase();
    const isLocalPage = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
    const configuredUrl = (env.VITE_API_URL || '').trim();
    const isLocalConfiguredUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(?::|\/|$)/i.test(configuredUrl);

    // Une URL localhost ne doit jamais être utilisée par une version déployée.
    if (configuredUrl && (!isLocalConfiguredUrl || isLocalPage)) {
        return configuredUrl.replace(/\/$/, '');
    }

    // En local, on cible le serveur backend de dev.
    if (isLocalPage) {
        return 'http://localhost:5000/api';
    }

    // En production, les appels vont directement vers l'API Render.
    return RENDER_API_URL;
}

// Retourne les URLs candidates pour les appels API, actuellement un seul endpoint principal.
export function getApiCandidates(env = {}, location = {}) {
    return [resolveApiBaseUrl(env, location)];
}

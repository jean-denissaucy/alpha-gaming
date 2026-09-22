// Détermine l'URL backend à utiliser selon la configuration locale ou la production.
export function resolveApiBaseUrl(env = {}, location = {}) {
    // Priorité à la variable d'environnement si elle est définie.
    const configuredUrl = (env.VITE_API_URL || '').trim();

    if (configuredUrl) {
        return configuredUrl.replace(/\/$/, '');
    }

    // En local, on cible le serveur backend de dev.
    const hostname = (location.hostname || '').toLowerCase();

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
        return 'http://localhost:10000/api';
    }

    // En prod, le front doit utiliser le chemin relatif /api pour passer via le host.
    return '/api';
}

// Retourne les URLs candidates pour les appels API, actuellement un seul endpoint principal.
export function getApiCandidates(env = {}, location = {}) {
    return [resolveApiBaseUrl(env, location)];
}

export function resolveApiBaseUrl(env = {}, location = {}) {
    const configuredUrl = (env.VITE_API_URL || '').trim();

    if (configuredUrl) {
        return configuredUrl.replace(/\/$/, '');
    }

    const hostname = (location.hostname || '').toLowerCase();

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
        return 'http://localhost:5000/api';
    }

    return '/api';
}

export function getApiCandidates(env = {}, location = {}) {
    const primary = resolveApiBaseUrl(env, location);
    const fallback = 'https://alpha-gaming-1.onrender.com/api';

    return [primary, fallback].filter((value, index, values) => values.indexOf(value) === index);
}

import process from 'node:process';
import { Buffer } from 'node:buffer';

function getBackendApiUrl() {
    const backendApiUrl = (process.env.BACKEND_API_URL || 'https://alpha-gaming.onrender.com/api')
        .trim()
        .replace(/\/$/, '');

    if (!backendApiUrl) {
        throw new Error('BACKEND_API_URL manquant dans la configuration Vercel');
    }

    const normalizedUrl = new URL(backendApiUrl);
    if (normalizedUrl.pathname === '/' || normalizedUrl.pathname === '') {
        normalizedUrl.pathname = '/api';
    }

    return normalizedUrl.toString().replace(/\/$/, '');
}

function getBackendPath(req) {
    const requestUrl = new URL(req.url || '/', 'https://alpha-gaming.vercel.app');
    const apiPath = requestUrl.pathname.replace(/^\/api(?=\/|$)/, '') || '/';
    return `${apiPath}${requestUrl.search}`;
}

function getRequestBody(req) {
    if (req.body === undefined || req.body === null || req.body === '') {
        return undefined;
    }

    if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
        return req.body;
    }

    return JSON.stringify(req.body);
}

function setCorsHeaders(req, res) {
    const requestOrigin = req.headers.origin;
    const allowedOrigins = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

export default async function handler(req, res) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    try {
        const backendUrl = new URL(`${getBackendApiUrl()}${getBackendPath(req)}`);
        const headers = {};

        if (req.headers.authorization) {
            headers.Authorization = req.headers.authorization;
        }

        if (req.headers['content-type']) {
            headers['Content-Type'] = req.headers['content-type'];
        }

        const body = getRequestBody(req);
        const response = await fetch(backendUrl, {
            method: req.method,
            headers,
            body,
            signal: AbortSignal.timeout(10000)
        });

        const responseBody = await response.arrayBuffer();
        res.statusCode = response.status;
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
        res.end(Buffer.from(responseBody));
    } catch (error) {
        console.error('Proxy backend indisponible:', error.message);
        res.statusCode = error.message.includes('BACKEND_API_URL') ? 500 : 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            success: false,
            error: 'API backend indisponible',
            statusCode: res.statusCode
        }));
    }
}

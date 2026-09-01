// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { testConnection } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import newsRoutes from './routes/news.routes.js';
import gamesRoutes from './routes/games.routes.js';
import { buildErrorResponse, buildSuccessResponse } from './utils/response.js';
const app = express();
const PORT = process.env.PORT || 5000;

// Connexion BDD : Render doit recevoir les paramètres MySQL de Plesk.
if (process.env.DB_HOST) {
    testConnection();
} else {
    console.error('Configuration MySQL absente : DB_HOST, DB_USER, DB_PASSWORD et DB_NAME sont requis.');
}

// Middlewares
const envAllowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    if (envAllowedOrigins.includes(origin)) {
        return true;
    }

    return (
        /^http:\/\/localhost(?::\d+)?$/.test(origin)
        || /^http:\/\/127\.0\.0\.1(?::\d+)?$/.test(origin)
        || /^http:\/\/[a-z0-9-]+\.test(?::\d+)?$/i.test(origin)
    );
};

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origine CORS non autorisee'));
    },
    credentials: true
}));
app.use(express.json());

// Logger (dev)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
        next();
    });
}

// Routes
app.get('/', (req, res) => {
    res.json(buildSuccessResponse({ message: 'Starter Kit API (ES Modules)', status: 'online' }));
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes news publiques
app.use('/api/news', newsRoutes);

// Routes games publiques
app.use('/api/games', gamesRoutes);

// 404
app.use((req, res) => res.status(404).json(buildErrorResponse('Route non trouvée', 404)));

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Serveur sur http://localhost:${PORT}`);
    });
}

export default app;
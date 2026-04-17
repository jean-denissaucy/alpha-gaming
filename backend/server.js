// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { testConnection } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import newsRoutes from './routes/news.routes.js';
const app = express();
const PORT = process.env.PORT || 5000;

// Connexion BDD
testConnection();

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
    res.json({ message: 'Starter Kit API (ES Modules)', status: 'online' });
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes news publiques
app.use('/api/news', newsRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Route non trouvée' }));

// Démarrage
app.listen(PORT, () => {
    console.log(`Serveur sur http://localhost:${PORT}`);
});
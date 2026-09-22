// config/db.js
// Centralise la connexion à MySQL via un pool réutilisable pour toutes les requêtes du backend.
import mysql from 'mysql2/promise';

const configuredPort = Number.parseInt(process.env.DB_PORT, 10);
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'alpha-gaming',
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Détermine si une erreur est liée à la base de données et doit être signalée comme indisponible.
export function isDatabaseError(error) {
    return [
        'ECONNREFUSED',
        'ENOTFOUND',
        'ETIMEDOUT',
        'PROTOCOL_CONNECTION_LOST',
        'ER_ACCESS_DENIED_ERROR',
        'ER_BAD_DB_ERROR',
        'ER_NO_SUCH_TABLE',
        'ER_TABLEACCESS_DENIED_ERROR',
        'EAI_AGAIN',
        'ENETUNREACH',
        'EHOSTUNREACH'
    ].includes(error?.code);
}

// Wrapper simple des requêtes SQL pour éviter de répéter le pool et les paramètres à chaque fois.
export async function query(sql, params = []) {
    const [results] = await pool.execute(sql, params);
    return results;
}

// Renvoie l'état de configuration de la base pour faciliter le diagnostic.
export function getDatabaseConfigStatus() {
    return {
        hostConfigured: Boolean(process.env.DB_HOST),
        userConfigured: Boolean(process.env.DB_USER),
        passwordConfigured: Boolean(process.env.DB_PASSWORD),
        databaseConfigured: Boolean(process.env.DB_NAME),
        port: Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 3306
    };
}

// Teste la connexion au serveur MySQL afin de confirmer que le backend peut communiquer avec la BDD.
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.query('SELECT 1');
        console.log(`MySQL connecté (${process.env.DB_HOST || 'localhost'}:${Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 3306}/${process.env.DB_NAME || 'alpha-gaming'})`);
        connection.release();
        return true;
    } catch (error) {
        console.error('Erreur MySQL:', {
            code: error.code || 'UNKNOWN',
            host: process.env.DB_HOST || 'localhost',
            port: Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 3306,
            database: process.env.DB_NAME || 'alpha-gaming'
        });
        return false;
    }
}

export default pool;

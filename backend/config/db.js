// config/db.js
import mysql from 'mysql2/promise';

const mysqlUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
const urlConfig = mysqlUrl ? new URL(mysqlUrl) : null;

const pool = mysql.createPool({
    host: urlConfig?.hostname || process.env.DB_HOST || 'localhost',
    port: urlConfig?.port ? Number(urlConfig.port) : Number(process.env.DB_PORT || 3306),
    user: urlConfig ? decodeURIComponent(urlConfig.username) : (process.env.DB_USER || 'root'),
    password: urlConfig ? decodeURIComponent(urlConfig.password) : (process.env.DB_PASSWORD || ''),
    database: urlConfig?.pathname ? urlConfig.pathname.slice(1) : (process.env.DB_NAME || 'alpha-gaming'),
    waitForConnections: true,
    connectionLimit: 10,
    ssl: process.env.DB_SSL === 'true' ? {} : undefined
});

// Fonction utilitaire pour les requêtes
export async function query(sql, params = []) {
    const [results] = await pool.execute(sql, params);
    return results;
}

// Test de connexion
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL connecté');
        connection.release();
        return true;
    } catch (error) {
        console.error('Erreur MySQL:', error.message);
        return false;
    }
}

export default pool;

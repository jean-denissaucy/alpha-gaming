import { query } from '../config/db.js';

export async function findUserByEmail(email) {
    const users = await query(
        `SELECT id, email, password, firstname, lastname, created_at
         FROM users
         WHERE email = ?
         LIMIT 1`,
        [String(email || '').trim().toLowerCase()]
    );

    return users[0] || null;
}

export async function findUserById(id) {
    const users = await query(
        `SELECT id, email, firstname, lastname, created_at
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [id]
    );

    return users[0] || null;
}

export async function createUserRecord({ email, hashedPassword, firstname, lastname }) {
    const result = await query(
        `INSERT INTO users (email, password, firstname, lastname)
         VALUES (?, ?, ?, ?)`,
        [
            String(email || '').trim().toLowerCase(),
            hashedPassword,
            String(firstname || '').trim(),
            String(lastname || '').trim()
        ]
    );

    return {
        insertId: result.insertId,
        firstname: String(firstname || '').trim(),
        lastname: String(lastname || '').trim()
    };
}
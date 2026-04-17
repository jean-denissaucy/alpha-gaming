// models/user.model.js
import { query } from '../config/db.js'; // Extension .js obligatoire ! ⬅️
import bcrypt from 'bcrypt';
const User = {
    // Trouver par email
    async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const results = await query(sql, [email.toLowerCase()]);
        return results[0] || null;
    },
    // Trouver par ID (sans le password)
    async findById(id) {
        try {
            const sql = 'SELECT id, email, firstname, lastname, created_at FROM users WHERE id = ?';
            const results = await query(sql, [id]);
            return results[0] || null;
        } catch (error) {
            if (error.code !== 'ER_BAD_FIELD_ERROR') throw error;
            const fallbackSql = 'SELECT id, email, name, created_at FROM users WHERE id = ?';
            const fallbackResults = await query(fallbackSql, [id]);
            return fallbackResults[0] || null;
        }
    },
    // Créer un utilisateur
    async create({ email, password, firstname, lastname }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
INSERT INTO users (email, password, firstname, lastname)
VALUES (?, ?, ?, ?)
`;
        let result;

        try {
            result = await query(sql, [
                email.toLowerCase(),
                hashedPassword,
                firstname,
                lastname
            ]);
        } catch (error) {
            if (error.code !== 'ER_BAD_FIELD_ERROR') throw error;
            const fallbackSql = `
INSERT INTO users (email, password, name)
VALUES (?, ?, ?)
`;
            result = await query(fallbackSql, [
                email.toLowerCase(),
                hashedPassword,
                `${firstname} ${lastname}`.trim()
            ]);
        }

        return { id: result.insertId, email, firstname, lastname };
    },
    // Vérifier le mot de passe
    async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
};
export default User;
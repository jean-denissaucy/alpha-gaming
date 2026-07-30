// models/user.model.js
import bcrypt from 'bcrypt';
import {
    createUserRecord,
    findUserByEmail,
    findUserById
} from '../queries/user.queries.js';
const User = {
    // Trouver par email
    async findByEmail(email) {
        return findUserByEmail(email);
    },
    // Trouver par ID (sans le password)
    async findById(id) {
        return findUserById(id);
    },
    // Créer un utilisateur
    async create({ email, password, firstname, lastname }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await createUserRecord({
            email,
            hashedPassword,
            firstname,
            lastname
        });

        return { id: result.insertId, email, firstname: result.firstname, lastname: result.lastname };
    },
    // Vérifier le mot de passe
    async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
};
export default User;
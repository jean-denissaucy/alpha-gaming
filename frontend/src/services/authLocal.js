function readUsers() {
    try {
        return JSON.parse(localStorage.getItem('alpha-gaming-users') || '[]');
    } catch {
        return [];
    }
}

function writeUsers(users) {
    localStorage.setItem('alpha-gaming-users', JSON.stringify(users));
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function buildToken(user) {
    const payload = btoa(JSON.stringify({ id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname }));
    return `local.${payload}`;
}

export const authLocalService = {
    async register(userData) {
        const users = readUsers();
        const normalizedEmail = normalizeEmail(userData.email);

        if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
            throw { status: 409, message: 'Email déjà utilisé' };
        }

        const newUser = {
            id: Date.now(),
            email: normalizedEmail,
            firstname: String(userData.firstname || '').trim(),
            lastname: String(userData.lastname || '').trim(),
            password: String(userData.password || '')
        };

        users.push(newUser);
        writeUsers(users);

        const token = buildToken(newUser);
        return {
            success: true,
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstname: newUser.firstname,
                lastname: newUser.lastname
            }
        };
    },

    async login(email, password) {
        const users = readUsers();
        const normalizedEmail = normalizeEmail(email);
        const user = users.find((candidate) => normalizeEmail(candidate.email) === normalizedEmail && String(candidate.password || '') === String(password || ''));

        if (!user) {
            throw { status: 401, message: 'Identifiants incorrects' };
        }

        const token = buildToken(user);
        return {
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname
            }
        };
    },

    async getProfile() {
        const token = localStorage.getItem('token');
        if (!token) {
            throw { status: 401, message: 'Token manquant' };
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1] || ''));
            return { success: true, user: payload };
        } catch {
            throw { status: 401, message: 'Token invalide' };
        }
    }
};

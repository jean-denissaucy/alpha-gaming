import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const storeFile = path.join(dataDir, 'store.json');

const defaultStore = {
    users: []
};

function normalizeEmail(email = '') {
    return String(email).trim().toLowerCase();
}

function ensureStoreShape(store = {}) {
    return {
        users: Array.isArray(store.users) ? store.users : [],
        ...store
    };
}

async function readStore() {
    try {
        const raw = await fs.readFile(storeFile, 'utf8');
        const parsed = JSON.parse(raw);
        return ensureStoreShape(parsed);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(dataDir, { recursive: true });
            await fs.writeFile(storeFile, JSON.stringify(defaultStore, null, 2), 'utf8');
            return ensureStoreShape(defaultStore);
        }

        throw error;
    }
}

async function writeStore(store) {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(storeFile, JSON.stringify(store, null, 2), 'utf8');
}

export async function findUserByEmail(email) {
    const store = await readStore();
    const normalizedEmail = normalizeEmail(email);

    return store.users.find((user) => normalizeEmail(user.email) === normalizedEmail) || null;
}

export async function findUserById(id) {
    const store = await readStore();
    return store.users.find((user) => Number(user.id) === Number(id)) || null;
}

export async function createUserRecord({ email, hashedPassword, firstname, lastname }) {
    const store = await readStore();
    const normalizedEmail = normalizeEmail(email);
    const existingUser = store.users.find((user) => normalizeEmail(user.email) === normalizedEmail);

    if (existingUser) {
        throw new Error('USER_ALREADY_EXISTS');
    }

    const newUser = {
        id: Date.now(),
        email: normalizedEmail,
        password: hashedPassword,
        firstname: String(firstname || '').trim(),
        lastname: String(lastname || '').trim(),
        created_at: new Date().toISOString()
    };

    store.users.push(newUser);
    await writeStore(store);

    return {
        insertId: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname
    };
}

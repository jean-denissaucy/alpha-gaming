import { createUserRecord as createStorageUser, findUserByEmail as findStorageUserByEmail, findUserById as findStorageUserById } from '../config/storage.js';

export async function findUserByEmail(email) {
    return findStorageUserByEmail(email);
}

export async function findUserById(id) {
    return findStorageUserById(id);
}

export async function createUserRecord({ email, hashedPassword, firstname, lastname }) {
    return createStorageUser({ email, hashedPassword, firstname, lastname });
}
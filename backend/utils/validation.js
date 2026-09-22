// utils/validation.js
// Validation des entrées utilisateur côté serveur.
// Le frontend valide déjà, mais le serveur ne doit jamais faire confiance aux données reçues.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;
// bcrypt ne hache que les 72 premiers octets : au-delà, la fin du mot de passe est ignorée.
export const MAX_PASSWORD_LENGTH = 72;
// Aligné sur les colonnes MySQL (users.email varchar(150), firstname/lastname varchar(100)).
export const MAX_EMAIL_LENGTH = 150;
export const MAX_NAME_LENGTH = 100;

// Valide les champs d'inscription et renvoie les valeurs normalisées (trim + email en minuscules).
// Accepte n'importe quelle entrée (null, undefined, string…) sans jamais lever d'exception.
export function validateRegistration(payload = {}) {
    const data = payload || {};
    const errors = [];

    const normalizedEmail = String(data.email ?? '').trim().toLowerCase();
    const normalizedFirstname = String(data.firstname ?? '').trim();
    const normalizedLastname = String(data.lastname ?? '').trim();
    const normalizedPassword = String(data.password ?? '');

    if (!normalizedEmail) {
        errors.push("L'email est requis.");
    } else if (normalizedEmail.length > MAX_EMAIL_LENGTH) {
        errors.push(`L'email ne doit pas dépasser ${MAX_EMAIL_LENGTH} caractères.`);
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
        errors.push("Le format de l'email est invalide.");
    }

    if (!normalizedPassword) {
        errors.push('Le mot de passe est requis.');
    } else if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
        errors.push(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
    } else if (normalizedPassword.length > MAX_PASSWORD_LENGTH) {
        errors.push(`Le mot de passe ne doit pas dépasser ${MAX_PASSWORD_LENGTH} caractères.`);
    }

    if (!normalizedFirstname) {
        errors.push('Le prénom est requis.');
    } else if (normalizedFirstname.length > MAX_NAME_LENGTH) {
        errors.push(`Le prénom ne doit pas dépasser ${MAX_NAME_LENGTH} caractères.`);
    }

    if (!normalizedLastname) {
        errors.push('Le nom est requis.');
    } else if (normalizedLastname.length > MAX_NAME_LENGTH) {
        errors.push(`Le nom ne doit pas dépasser ${MAX_NAME_LENGTH} caractères.`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        values: {
            email: normalizedEmail,
            password: normalizedPassword,
            firstname: normalizedFirstname,
            lastname: normalizedLastname
        }
    };
}

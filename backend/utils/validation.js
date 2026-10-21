// utils/validation.js
// Validation des entrées utilisateur côté serveur.
// Le frontend valide déjà, mais le serveur ne doit jamais faire confiance aux données reçues.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Longueurs communes utilisées par les validations de mot de passe.
export const MIN_PASSWORD_LENGTH = 8;
// bcrypt ne hache que les 72 premiers octets : au-delà, la fin du mot de passe est ignorée.
export const MAX_PASSWORD_LENGTH = 72;
// Aligné sur les colonnes MySQL (users.email varchar(150), firstname/lastname varchar(100)).
export const MAX_EMAIL_LENGTH = 150;
export const MAX_NAME_LENGTH = 100;

// Valide les champs d'inscription et renvoie les valeurs normalisées (trim + email en minuscules).
// Accepte n'importe quelle entrée (null, undefined, string…) sans jamais lever d'exception.
export function validateRegistration(payload = {}) {
    // Un payload nul est remplacé par un objet vide afin de valider proprement les champs manquants.
    const data = payload || {};
    const errors = [];

    // Les noms sont nettoyés, tandis que le mot de passe conserve exactement sa valeur.
    const normalizedEmail = String(data.email ?? '').trim().toLowerCase();
    const normalizedFirstname = String(data.firstname ?? '').trim();
    const normalizedLastname = String(data.lastname ?? '').trim();
    const normalizedPassword = String(data.password ?? '');

    // Vérifie la présence, la taille et le format de l'adresse électronique.
    if (!normalizedEmail) {
        errors.push("L'email est requis.");
    } else if (normalizedEmail.length > MAX_EMAIL_LENGTH) {
        errors.push(`L'email ne doit pas dépasser ${MAX_EMAIL_LENGTH} caractères.`);
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
        errors.push("Le format de l'email est invalide.");
    }

    // Vérifie les limites imposées aux mots de passe par l'application et bcrypt.
    if (!normalizedPassword) {
        errors.push('Le mot de passe est requis.');
    } else if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
        errors.push(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
    } else if (normalizedPassword.length > MAX_PASSWORD_LENGTH) {
        errors.push(`Le mot de passe ne doit pas dépasser ${MAX_PASSWORD_LENGTH} caractères.`);
    }

    // Vérifie que le prénom est renseigné et compatible avec la taille de la colonne en base.
    if (!normalizedFirstname) {
        errors.push('Le prénom est requis.');
    } else if (normalizedFirstname.length > MAX_NAME_LENGTH) {
        errors.push(`Le prénom ne doit pas dépasser ${MAX_NAME_LENGTH} caractères.`);
    }

    // Vérifie que le nom est renseigné et compatible avec la taille de la colonne en base.
    if (!normalizedLastname) {
        errors.push('Le nom est requis.');
    } else if (normalizedLastname.length > MAX_NAME_LENGTH) {
        errors.push(`Le nom ne doit pas dépasser ${MAX_NAME_LENGTH} caractères.`);
    }

    // Retourne les erreurs et les valeurs normalisées pour éviter une seconde normalisation côté contrôleur.
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

// Valide une demande de changement de mot de passe (utilisateur connecté).
// Les mots de passe ne sont PAS trimés : un espace peut être volontaire dans un mot de passe.
export function validatePasswordChange(payload = {}) {
    // Un payload nul est traité comme une demande vide plutôt que de provoquer une exception.
    const data = payload || {};
    const errors = [];

    // Les espaces sont conservés car ils peuvent faire partie volontairement d'un mot de passe.
    const currentPassword = String(data.currentPassword ?? '');
    const newPassword = String(data.newPassword ?? '');

    // Le mot de passe actuel est contrôlé avant toute comparaison avec le nouveau.
    if (!currentPassword) {
        errors.push('Le mot de passe actuel est requis.');
    } else if (currentPassword.length > MAX_PASSWORD_LENGTH) {
        errors.push(`Le mot de passe actuel ne doit pas dépasser ${MAX_PASSWORD_LENGTH} caractères.`);
    }

    // Le nouveau mot de passe doit respecter les limites et être différent de l'ancien.
    if (!newPassword) {
        errors.push('Le nouveau mot de passe est requis.');
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
        errors.push(`Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
    } else if (newPassword.length > MAX_PASSWORD_LENGTH) {
        errors.push(`Le nouveau mot de passe ne doit pas dépasser ${MAX_PASSWORD_LENGTH} caractères.`);
    } else if (currentPassword && newPassword === currentPassword) {
        errors.push("Le nouveau mot de passe doit être différent du mot de passe actuel.");
    }

    // Retourne les valeurs non modifiées pour permettre au contrôleur de les utiliser après validation.
    return {
        isValid: errors.length === 0,
        errors,
        values: { currentPassword, newPassword }
    };
}

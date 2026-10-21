// Format standardisé pour les réponses HTTP réussies.
// Les champs supplémentaires préservent la compatibilité avec les anciennes réponses.
export const buildSuccessResponse = (data = {}, extras = {}) => ({
    success: true,
    data,
    ...extras
});

// Format standardisé pour les réponses HTTP en erreur.
// Le code HTTP est inclus dans le corps pour garder une structure exploitable côté client.
export const buildErrorResponse = (error, statusCode = 500) => ({
    success: false,
    error,
    statusCode
});

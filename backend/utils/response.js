// Format standardisé pour les réponses HTTP réussies.
export const buildSuccessResponse = (data = {}, extras = {}) => ({
    success: true,
    data,
    ...extras
});

// Format standardisé pour les réponses HTTP en erreur.
export const buildErrorResponse = (error, statusCode = 500) => ({
    success: false,
    error,
    statusCode
});

export const buildSuccessResponse = (data = {}, extras = {}) => ({
    success: true,
    data,
    ...extras
});

export const buildErrorResponse = (error, statusCode = 500) => ({
    success: false,
    error,
    statusCode
});

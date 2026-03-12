export interface ErrorResponse {
    status: "error";
    error: {
        type: string;
        code: string;
        message: string;
    };
}

export interface CustomError extends Error {
    statusCode?: number;
}
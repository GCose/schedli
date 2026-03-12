export class AppError extends Error {
    statusCode: number;
    type: string;
    code: string;

    constructor(message: string, statusCode: number, type: string, code: string) {
        super(message);
        this.statusCode = statusCode;
        this.type = type;
        this.code = code;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
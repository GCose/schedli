import { AxiosError } from "axios";
import type { ErrorResponse, CustomError } from "@/types";

export const getErrorMessage = (err: AxiosError<ErrorResponse> | CustomError | Error) => {
    const response = (err as AxiosError<ErrorResponse>).response;

    if (response) {
        const { data, status } = response;
        if (data?.error) {
            return {
                statusCode: status,
                type: data.error.type,
                code: data.error.code,
                message: data.error.message,
            };
        }
    }

    return {
        statusCode: (err as CustomError)?.statusCode ?? 500,
        type: "server_error",
        code: "INTERNAL_SERVER_ERROR",
        message: err.message ?? "An error occurred. Please try again later.",
    };
};
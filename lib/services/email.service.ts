import { Resend } from "resend";
import { AppError } from "@/lib/utils/AppError";
import type { SendEmailInput } from "@/lib/types";
import { ErrorType, ErrorCode } from "@/lib/utils/errorCodes";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_EMAIL = `Schedli <${process.env.RESEND_FROM_EMAIL}>`;

export async function sendEmail(input: SendEmailInput): Promise<void> {
    const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: input.to,
        subject: input.subject,
        html: input.html,
    });

    if (error) {
        throw new AppError(
            "Failed to send email. Please try again later.",
            500,
            ErrorType.SERVER,
            ErrorCode.INTERNAL_SERVER_ERROR
        );
    }
}
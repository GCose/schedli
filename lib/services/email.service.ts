import { Resend } from "resend";
import type { SendEmailInput } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_EMAIL = "Schedli <onboarding@resend.dev>";

export async function sendEmail(input: SendEmailInput): Promise<void> {
    await resend.emails.send({
        from: FROM_EMAIL,
        to: input.to,
        subject: input.subject,
        html: input.html,
    });
}
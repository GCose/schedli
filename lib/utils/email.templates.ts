const BASE_URL = process.env.APP_URL!;

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Schedli</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F9F9;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">

          <tr>
            <td align="center" style="padding:40px 40px 32px;">
              <img
                src="https://res.cloudinary.com/ddmdjtgbz/image/upload/v1773243977/Schedli___Icon_uapyb4.png"
                alt="Schedli"
                width="120"
                height="auto"
                style="display:block;"
              />
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 40px;">
              ${content}
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 40px;border-top:1px solid #F9F9F9;">
              <p style="margin:0;font-size:12px;color:#B0B0B0;">
                © ${new Date().getFullYear()} Schedli. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const heading = (text: string) => `
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#171717;">${text}</h1>
`;

const paragraph = (content: string) => `
  <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#636363;">${content}</p>
`;

const button = (label: string, url: string) => `
  <a
    href="${url}"
    style="display:block;width:100%;padding:14px 0;background:#2563EB;color:#ffffff;font-size:16px;font-weight:600;text-align:center;border-radius:8px;text-decoration:none;box-sizing:border-box;"
  >
    ${label}
  </a>
`;

const smallText = (content: string) => `
  <p style="margin:16px 0 0;font-size:13px;color:#B0B0B0;text-align:center;">${content}</p>
`;

export function verificationEmailTemplate(
  fullName: string,
  token: string
): string {
  return emailWrapper(`
    ${heading(`Welcome to Schedli, ${fullName}!`)}
    ${paragraph("To complete your account setup, verify your email address. This link expires in 24 hours.")}
    ${button("Verify Email", `${BASE_URL}/verify-email?token=${token}`)}
    ${smallText("If you didn't create an account, you can safely ignore this email.")}
  `);
}

export function passwordResetEmailTemplate(
  fullName: string,
  token: string
): string {
  return emailWrapper(`
    ${heading("Reset your password")}
    ${paragraph(`Hi ${fullName}, we received a request to reset your Schedli password. This link expires in 1 hour.`)}
    ${button("Reset Password", `${BASE_URL}/reset-password?token=${token}`)}
    ${smallText("If you didn't request this, you can safely ignore this email.")}
  `);
}
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!resend || !apiKey) {
    return { skipped: true };
  }

  return resend.emails.send({
    from: "Society Maintenance Tracker <noreply@society-maintenance.local>",
    to,
    subject,
    html,
  });
}

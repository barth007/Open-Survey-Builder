import nodemailer from 'nodemailer';
import { config } from './config.js';

function createTransporter() {
  const { host, port, secure, user, pass } = config.smtp;

  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    ...(user && pass ? { auth: { user, pass } } : {}),
  });
}

export interface TransactionalEmailParams {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  senderName?: string;
}

export async function sendTransactionalEmail(params: TransactionalEmailParams): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[mailer] SMTP_HOST not configured — skipping transactional email to', params.to);
    return;
  }

  const from = params.senderName
    ? `"${params.senderName.replace(/"/g, '\\"')}" <${config.smtp.from}>`
    : config.smtp.from;

  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
    ...(params.replyTo ? { replyTo: params.replyTo } : {}),
  });
}

export interface InvitationEmailParams {
  to: string;
  teamName: string;
  inviterName: string | null;
  invitationCode: string;
}

export async function sendInvitationEmail(params: InvitationEmailParams): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[mailer] SMTP_HOST not configured — skipping invitation email to', params.to);
    return;
  }

  const { to, teamName, inviterName, invitationCode } = params;
  const frontendUrl = config.frontendUrl || 'http://localhost:3100';
  const profileUrl = `${frontendUrl}/profile`;
  const loginUrl = `${frontendUrl}/login`;
  const inviter = inviterName || 'A team member';

  const text = [
    `You have been invited to join the team "${teamName}" on Survey Builder.`,
    '',
    `Invited by: ${inviter}`,
    `Your invitation code: ${invitationCode}`,
    '',
    'To accept this invitation:',
    `1. Log in or create an account at: ${loginUrl}`,
    `2. Go to your profile: ${profileUrl}`,
    `3. Open the "Team" tab and accept the pending invitation.`,
    '',
    'This invitation expires in 7 days.',
    '',
    'If you did not expect this invitation, you can safely ignore this email.',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
  <h2 style="margin-bottom:4px">You have been invited</h2>
  <p style="color:#555;margin-top:0">
    ${inviter} has invited you to join the team
    <strong>${escapeHtml(teamName)}</strong> on Survey Builder.
  </p>

  <table style="background:#f6f6f6;border-radius:8px;padding:16px;width:100%;border-collapse:collapse;margin:20px 0">
    <tr><td style="padding:4px 0;color:#555;font-size:13px">Invitation code</td></tr>
    <tr><td style="font-family:monospace;font-size:15px;letter-spacing:0.05em">${escapeHtml(invitationCode)}</td></tr>
  </table>

  <p style="margin-bottom:8px">To accept this invitation:</p>
  <ol style="padding-left:20px;line-height:1.8">
    <li>
      <a href="${loginUrl}" style="color:#6366f1">Log in or create an account</a>
    </li>
    <li>
      Open your <a href="${profileUrl}" style="color:#6366f1">profile page</a>
    </li>
    <li>Go to the <strong>Team</strong> tab and accept the pending invitation.</li>
  </ol>

  <p style="color:#888;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">
    This invitation expires in 7 days. If you did not expect this, you can safely ignore this email.
  </p>
</body>
</html>
`.trim();

  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject: `You've been invited to join "${teamName}" on Survey Builder`,
    text,
    html,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

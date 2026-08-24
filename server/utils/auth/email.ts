import { Resend } from "resend";

// Envía el email de verificación de cuenta con el magic link de activación.
export const sendVerificationEmail = async (
  email: string,
  verifyUrl: string,
) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const response = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Confirm your account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 16px;">Confirm your account</h2>
        <p style="color: #444; margin-bottom: 24px;">
          Click the link below to verify your email address and activate your account:
        </p>
        <a href="${verifyUrl}"
          style="display: inline-block; padding: 12px 24px; background: #1867C0; color: white;
                 text-decoration: none; border-radius: 6px; font-weight: 600;">
          Verify account
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px;">
          The link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });
  return response;
};

// Envía el email de recuperación de contraseña con el enlace de reset.
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const response = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #444; margin-bottom: 24px;">
          You requested to reset your password. Click the link below to create a new one:
        </p>
        <a href="${resetUrl}"
          style="display: inline-block; padding: 12px 24px; background: #1867C0; color: white;
                 text-decoration: none; border-radius: 6px; font-weight: 600;">
          Reset password
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px;">
          The link expires in 1 hour. If you didn't request this change, ignore this email.
        </p>
      </div>
    `,
  });
  return response;
};

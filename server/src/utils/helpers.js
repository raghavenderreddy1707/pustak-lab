import crypto from 'crypto'
import nodemailer from 'nodemailer'

export const hashFile = (buffer) =>
  crypto.createHash('sha256').update(buffer).digest('hex')

export const generateToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex')

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = createTransporter()

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Pustak Lab" <noreply@pustaklab.com>',
    to: email,
    subject: 'Reset your Pustak Lab password',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Inter, sans-serif; background: #f8fafc; padding: 40px 0;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); width: 52px; height: 52px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">📚</span>
            </div>
            <h1 style="color: #1e293b; margin: 16px 0 8px; font-size: 22px;">Reset your password</h1>
            <p style="color: #64748b; margin: 0; font-size: 14px;">You requested a password reset for your Pustak Lab account</p>
          </div>
          <a href="${resetUrl}" style="display: block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; text-decoration: none; padding: 14px 24px; border-radius: 12px; text-align: center; font-weight: 600; font-size: 15px; margin: 24px 0;">
            Reset My Password
          </a>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export const sendResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({ success: true, message, data })
}

export const createError = (message, statusCode = 400) => {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'admin@wincubemkt.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER || 'admin@wincubemkt.com',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send failed:', err);
  }
}

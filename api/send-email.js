import { createTransport } from 'nodemailer';

// Vercel serverless function - POST only
export default async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, text } = req.body || {};
  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Missing to, subject or text in request body' });
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    return res.status(500).json({ error: 'Email credentials are not configured' });
  }

  try {
    const transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    // send mail
    const info = await transporter.sendMail({
      from: user,
      to,
      subject,
      text,
    });

    return res.status(200).json({ message: 'Email sent!', info: info.response });
  } catch (err) {
    console.error('send-email error', err);
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }
};

import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, code: string) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error('❌ Missing EMAIL_USER or EMAIL_PASS');
    throw new Error('Email configuration missing.');
  }

  console.log('📧 Attempting to send email to:', email);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: { user, pass: pass.trim() },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const mailOptions = {
    from: user,
    to: email,
    subject: 'Your Verification Code',
    html: `<p>Your code is: <b>${code}</b></p><p>Valid for 10 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
    return info;
  } catch (error: any) {
    console.error('❌ Email error:', error);
    throw new Error(error.message);
  }
};

export default sendVerificationEmail;
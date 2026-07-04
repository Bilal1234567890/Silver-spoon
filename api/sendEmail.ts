import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, code: string) => {
  console.log('📧 Attempting to send email to:', email);
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
  console.log('📧 EMAIL_PASS length:', process.env.EMAIL_PASS?.trim().length || 0);

  // Use explicit SMTP with TLS (port 587) – more reliable on Railway
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.trim() || '',
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    html: `<p>Your verification code is: <b>${code}</b></p><p>It expires in 10 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.response);
    return info;
  } catch (error: any) {
    console.error('❌ Nodemailer error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    });
    throw new Error(`Email sending failed: ${error.message}`);
  }
};
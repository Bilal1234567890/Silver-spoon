import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, code: string) => {
  // Debug: log the credentials (without revealing the full password)
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
  console.log('📧 EMAIL_PASS length:', process.env.EMAIL_PASS?.length);

  // Explicit SMTP config (more reliable on Railway)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
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
    console.error('❌ Nodemailer error:', error);
    // Throw a detailed error to the frontend
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
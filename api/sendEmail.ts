import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, code: string) => {
  console.log('📧 Attempting to send email to:', email);
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
  console.log('📧 EMAIL_PASS length:', process.env.EMAIL_PASS?.length || 0);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.trim() || '', // trim any accidental spaces
    },
    // Timeout settings (in milliseconds)
    connectionTimeout: 10000, // 10 seconds
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
    console.error('❌ Nodemailer error:', error);
    // Throw a detailed error (will be caught in authController)
    throw new Error(error.message || 'Failed to send email');
  }
};
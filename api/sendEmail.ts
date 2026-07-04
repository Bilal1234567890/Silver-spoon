import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, code: string) => {
  // Check environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER or EMAIL_PASS is not set in environment variables');
  }

  console.log('📧 Sending email to:', email);
  console.log('📧 Using EMAIL_USER:', process.env.EMAIL_USER);

  // Use the simplest Gmail transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.trim(),
    },
    // Timeouts
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
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
    console.error('❌ Email failed – full error:', error);
    // Throw a clear message
    throw new Error(`Gmail error: ${error.message || 'Unknown error'}`);
  }
};
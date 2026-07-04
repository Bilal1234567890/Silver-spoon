import axios from 'axios';

export const sendVerificationEmail = async (email: string, code: string) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('❌ BREVO_API_KEY not set');
    throw new Error('Missing BREVO_API_KEY');
  }

  // Use a fallback sender – the email you used to sign up for Brevo
  const senderEmail = process.env.EMAIL_SENDER || process.env.EMAIL_USER || 'silverspooon6@gmail.com';

  const data = {
    sender: { email: senderEmail },
    to: [{ email }],
    subject: 'Verification Code',
    htmlContent: `<p>Your code is: <b>${code}</b></p><p>Valid for 10 minutes.</p>`,
  };

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      data,
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Email sent:', response.data.messageId);
    return response.data;
  } catch (error: any) {
    console.error('❌ Brevo API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

export default sendVerificationEmail;
const axios = require('axios');
require('dotenv').config();

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

console.log(' Debug: Environment variables check:');
console.log('BREVO_API_KEY exists:', !!BREVO_API_KEY);
console.log('SUPPORT_EMAIL:', process.env.SUPPORT_EMAIL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test API connection
const testConnection = async () => {
  try {
    const response = await axios.get('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': BREVO_API_KEY
      }
    });
    console.log('✅ Brevo API connection verified');
    return true;
  } catch (error) {
    console.error('❌ Brevo API connection failed:', error.response?.data || error.message);
    return false;
  }
};

// Send contact form email
const sendContactForm = async (formData) => {
  const { name, email, subject, message } = formData;

  const emailData = {
    sender: {
      name: 'TimeHaven Support',
      email: 'support@timehaven.app'
    },
    to: [
      {
        email: process.env.SUPPORT_EMAIL,
        name: 'TimeHaven Support'
      }
    ],
    subject: `Contact Form: ${subject}`,
    htmlContent: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr>
      <p><em>This email was sent from your TimeHaven contact form.</em></p>
    `
  };

  try {
    const response = await axios.post(BREVO_API_URL, emailData, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Contact form email sent successfully:', response.data.messageId);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error('❌ Error sending contact form email:', error.response?.data || error.message);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  const emailData = {
    sender: {
      name: 'TimeHaven',
      email: 'support@timehaven.app'
    },
    to: [
      {
        email: userEmail,
        name: userName
      }
    ],
    subject: 'Welcome to TimeHaven! ��',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #005dab;">Welcome to TimeHaven!</h1>
        <p>Hi ${userName},</p>
        <p>Welcome aboard! We're excited to have you join the TimeHaven community.</p>
        <p>TimeHaven helps you navigate timezone challenges and coordinate with teams across the globe.</p>
        <h2 style="color: #6caee0;">What's Next?</h2>
        <ul>
          <li>Connect your calendar</li>
          <li>Create or join a team</li>
          <li>Set your availability preferences</li>
          <li>Start scheduling meetings</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The TimeHaven Team</p>
      </div>
    `
  };

  try {
    const response = await axios.post(BREVO_API_URL, emailData, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Welcome email sent successfully:', response.data.messageId);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.response?.data || error.message);
    throw error;
  }
};

// Send team invitation email
const sendTeamInvitation = async (inviteeEmail, inviterName, teamName, invitationLink) => {
  const emailData = {
    sender: {
      name: 'TimeHaven',
      email: 'support@timehaven.app'
    },
    to: [
      {
        email: inviteeEmail,
        name: 'Team Member'
      }
    ],
    subject: `You're invited to join ${teamName} on TimeHaven! ��`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #005dab;">Team Invitation</h1>
        <p>Hi there!</p>
        <p><strong>${inviterName}</strong> has invited you to join the team <strong>${teamName}</strong> on TimeHaven.</p>
        <p>TimeHaven helps teams coordinate across timezones and schedule meetings efficiently.</p>
        <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #6caee0;">Join the Team</h3>
          <p>Click the button below to accept the invitation:</p>
          <a href="${invitationLink}" style="background-color: #005dab; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The TimeHaven Team</p>
      </div>
    `
  };

  try {
    const response = await axios.post(BREVO_API_URL, emailData, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Team invitation email sent successfully:', response.data.messageId);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error('❌ Error sending team invitation email:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  testConnection,
  sendContactForm,
  sendWelcomeEmail,
  sendTeamInvitation
};
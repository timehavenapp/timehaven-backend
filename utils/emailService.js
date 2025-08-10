const nodemailer = require('nodemailer');
require('dotenv').config();

// Email service configuration using environment variables
const emailConfig = {
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_API_KEY
  }
};

// Create reusable transporter object using SMTP transport
let transporter;

console.log(' Debug: Environment variables check:');
console.log('BREVO_EMAIL:', process.env.BREVO_EMAIL);
console.log('BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
console.log('SUPPORT_EMAIL:', process.env.SUPPORT_EMAIL);
console.log('NODE_ENV:', process.env.NODE_ENV);

try {
  transporter = nodemailer.createTransport(emailConfig); // FIXED: removed "er"
  console.log('✅ Email transporter created successfully');
  console.log(`📧 Using email: ${process.env.BREVO_EMAIL}`);
} catch (error) {
  console.error('❌ Error creating email transporter:', error);
  transporter = null;
}

// Test email connection
const testConnection = async () => {
  if (!transporter) {
    console.error('❌ No transporter available');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email connection test failed:', error);
    return false;
  }
};

// Send contact form email
const sendContactForm = async (formData) => {
  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }

  const { name, email, subject, message } = formData;

  const mailOptions = {
    from: process.env.BREVO_EMAIL,
    to: process.env.SUPPORT_EMAIL,
    subject: `Contact Form: ${subject}`,
    html: `
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
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Contact form email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending contact form email:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }

  const mailOptions = {
    from: process.env.BREVO_EMAIL,
    to: userEmail,
    subject: 'Welcome to TimeHaven! 🚢',
    html: `
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
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

// Send team invitation email
const sendTeamInvitation = async (inviteeEmail, inviterName, teamName, invitationLink) => {
  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }

  const mailOptions = {
    from: process.env.BREVO_EMAIL,
    to: inviteeEmail,
    subject: `You're invited to join ${teamName} on TimeHaven! 🚢`,
    html: `
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
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

module.exports = {
  testConnection,
  sendContactForm,
  sendWelcomeEmail,
  sendTeamInvitation
};
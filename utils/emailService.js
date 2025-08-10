const SibApiV3Sdk = require('@getbrevo/brevo');

// Configure Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Email service functions
const emailService = {
    // Send welcome email
    async sendWelcomeEmail(userEmail, userName) {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            
            sendSmtpEmail.subject = "Welcome to TimeHaven!";
            sendSmtpEmail.htmlContent = `
                <html>
                    <body>
                        <h1>Welcome to TimeHaven, ${userName}! 🎉</h1>
                        <p>We're excited to have you on board. TimeHaven will help you manage your time across different timezones and coordinate with your team.</p>
                        <p>If you have any questions, feel free to reach out to our support team.</p>
                        <br>
                        <p>Best regards,</p>
                        <p>The TimeHaven Team</p>
                    </body>
                </html>
            `;
            sendSmtpEmail.sender = { name: "TimeHaven", email: process.env.FROM_EMAIL };
            sendSmtpEmail.to = [{ email: userEmail, name: userName }];
            
            // Set API key for this request
            const apiKey = process.env.BREVO_API_KEY;
            if (!apiKey) {
                throw new Error('BREVO_API_KEY environment variable is not set');
            }
            
            // Set the API key in the default headers
            apiInstance.setApiKey('api-key', apiKey);
            
            const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending welcome email:', error);
            return { success: false, error: error.message };
        }
    },

    // Send team invitation email
    async sendTeamInvitation(inviterName, inviteeEmail, teamName, invitationLink) {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            
            sendSmtpEmail.subject = `You're invited to join ${teamName} on TimeHaven!`;
            sendSmtpEmail.htmlContent = `
                <html>
                    <body>
                        <h1>Team Invitation from ${inviterName} 🚀</h1>
                        <p>You've been invited to join <strong>${teamName}</strong> on TimeHaven!</p>
                        <p>TimeHaven helps teams coordinate across different timezones and manage availability efficiently.</p>
                        <br>
                        <p><strong>Click the link below to accept the invitation:</strong></p>
                        <p><a href="${invitationLink}" style="background-color: #005dab; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Invitation</a></p>
                        <br>
                        <p>If you have any questions, feel free to reach out to ${inviterName} or our support team.</p>
                        <br>
                        <p>Best regards,</p>
                        <p>The TimeHaven Team</p>
                    </body>
                </html>
            `;
            sendSmtpEmail.sender = { name: "TimeHaven", email: process.env.FROM_EMAIL };
            sendSmtpEmail.to = [{ email: inviteeEmail }];
            
            // Set API key for this request
            const apiKey = process.env.BREVO_API_KEY;
            if (!apiKey) {
                throw new Error('BREVO_API_KEY environment variable is not set');
            }
            
            // Set the API key in the default headers
            apiInstance.setApiKey('api-key', apiKey);
            
            const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending team invitation:', error);
            return { success: false, error: error.message };
        }
    },

    // Send password reset email
    async sendPasswordReset(userEmail, resetLink) {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            
            sendSmtpEmail.subject = "Reset Your TimeHaven Password";
            sendSmtpEmail.htmlContent = `
                <html>
                    <body>
                        <h1>Password Reset Request 🔐</h1>
                        <p>We received a request to reset your TimeHaven password.</p>
                        <p>Click the button below to create a new password:</p>
                        <br>
                        <p><a href="${resetLink}" style="background-color: #005dab; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
                        <br>
                        <p>If you didn't request this reset, you can safely ignore this email.</p>
                        <p>This link will expire in 1 hour for security reasons.</p>
                        <br>
                        <p>Best regards,</p>
                        <p>The TimeHaven Team</p>
                    </body>
                </html>
            `;
            sendSmtpEmail.sender = { name: "TimeHaven", email: process.env.FROM_EMAIL };
            sendSmtpEmail.to = [{ email: userEmail }];
            
            // Set API key for this request
            const apiKey = process.env.BREVO_API_KEY;
            if (!apiKey) {
                throw new Error('BREVO_API_KEY environment variable is not set');
            }
            
            // Set the API key in the default headers
            apiInstance.setApiKey('api-key', apiKey);
            
            const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending password reset:', error);
            return { success: false, error: error.message };
        }
    },

    // Send contact form email
    async sendContactForm(name, email, subject, message) {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            
            sendSmtpEmail.subject = `New Contact Form: ${subject}`;
            sendSmtpEmail.htmlContent = `
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h1 style="color: #005dab; border-bottom: 3px solid #6caee0; padding-bottom: 10px;">
                                New Contact Form Submission 📧
                            </h1>
                            
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h2 style="color: #005dab; margin-top: 0;">Contact Details</h2>
                                <p><strong>Name:</strong> ${name}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Subject:</strong> ${subject}</p>
                                <p><strong>Message:</strong></p>
                                <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #005dab;">
                                    ${message.replace(/\n/g, '<br>')}
                                </div>
                            </div>
                            
                            <div style="background-color: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                                <p style="margin: 5px 0 0 0;"><strong>🌐 Source:</strong> TimeHaven Contact Form</p>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="mailto:${email}" style="background-color: #005dab; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Reply to ${name}
                                </a>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                            <p style="text-align: center; color: #666; font-size: 14px;">
                                This email was sent from the TimeHaven contact form system.
                            </p>
                        </div>
                    </body>
                </html>
            `;
            sendSmtpEmail.sender = { name: "TimeHaven Contact Form", email: process.env.FROM_EMAIL };
            sendSmtpEmail.to = [{ email: process.env.FROM_EMAIL, name: "TimeHaven Support" }];
            
            // Set API key for this request
            const apiKey = process.env.BREVO_API_KEY;
            if (!apiKey) {
                throw new Error('BREVO_API_KEY environment variable is not set');
            }
            
            // Set the API key in the default headers
            apiInstance.setApiKey('api-key', apiKey);
            
            const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending contact form email:', error);
            return { success: false, error: error.message };
        }
    }
};

module.exports = emailService;
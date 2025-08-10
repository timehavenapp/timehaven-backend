const SibApiV3Sdk = require('@getbrevo/brevo');

// Configure Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.ApiClient.instance.authentications['api-key'], process.env.BREVO_API_KEY);

// Email service functions
const emailService = {
    // Send welcome email
    async sendWelcomeEmail(userEmail, userName) {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            
            sendSmtpEmail.subject = "Welcome to TimeHaven! ��";
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
            
            sendSmtpEmail.subject = `You're invited to join ${teamName} on TimeHaven! ��`;
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
            
            sendSmtpEmail.subject = "Reset Your TimeHaven Password ��";
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
            
            const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending password reset:', error);
            return { success: false, error: error.message };
        }
    }
};

module.exports = emailService;
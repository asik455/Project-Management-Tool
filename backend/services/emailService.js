const nodemailer = require('nodemailer');
const { emailTemplates } = require('../utils/emailService');

// For development, use Ethereal email
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode - using Ethereal email for testing');
  console.log('Emails will not be sent to real addresses');
  console.log('Check the console for email preview links');
}

// Create a test account if in development
const createTestAccount = async () => {
  if (process.env.NODE_ENV === 'development') {
    const testAccount = await nodemailer.createTestAccount();
    return {
      user: testAccount.user,
      pass: testAccount.pass,
      smtp: {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false
      }
    };
  }
  return null;
};

// Create transporter based on environment
const createTransporter = async () => {
  if (process.env.NODE_ENV === 'development') {
    const testAccount = await createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  // Production transporter - using Gmail
  console.log('Using Gmail SMTP for sending real emails');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"Project Management Tool" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const { subject, html } = emailTemplates.welcome(name);
  return sendEmail(email, subject, html);
};

// Send project assignment email
const sendProjectAssignmentEmail = async (email, projectName, assignerName, projectId) => {
  const { subject, html } = emailTemplates.projectAssignment(projectName, assignerName, projectId);
  return sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendProjectAssignmentEmail
};

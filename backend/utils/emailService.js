const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates
const emailTemplates = {
  // Existing templates
  newProject: (projectName, projectDetails) => ({
    subject: `New Project Created: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2c3e50;">New Project Created</h2>
        </div>
        <div style="margin-bottom: 20px;">
          <p>A new project has been created with the following details:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${projectName}</h3>
            <p><strong>Description:</strong> ${projectDetails.description || 'No description provided'}</p>
            <p><strong>Due Date:</strong> ${projectDetails.dueDate || 'Not specified'}</p>
            <p><strong>Team Size:</strong> ${projectDetails.team || 0} members</p>
          </div>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #7f8c8d;">
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    `
  }),

  // Welcome email template
  welcome: (name) => ({
    subject: 'Welcome to Project Management Tool!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2c3e50;">Welcome to Project Management Tool, ${name}!</h2>
        </div>
        <div style="margin-bottom: 20px;">
          <p>Hello ${name},</p>
          <p>Your account has been successfully created and is ready to use.</p>
          <p>You can now log in and start managing your projects efficiently.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Log In to Your Account
          </a>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #7f8c8d;">
          <p>If you did not create this account, please contact our support team immediately.</p>
        </div>
      </div>
    `
  }),

  // Project assignment template
  projectAssignment: (projectName, assignerName, projectId) => ({
    subject: `🎯 New Project Assignment: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2c3e50;">New Project Assignment</h2>
        </div>
        <div style="margin-bottom: 20px;">
          <p>Hello,</p>
          <p>You have been assigned to a new project by <strong>${assignerName}</strong>.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${projectName}</h3>
          </div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects/${projectId}" 
             style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Project
          </a>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #7f8c8d;">
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    `
  }),

  // Existing task template with enhanced styling
  newTask: (taskName, projectName, taskDetails) => ({
    subject: `✅ New Task: ${taskName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2c3e50;">New Task Created</h2>
        </div>
        <div style="margin-bottom: 20px;">
          <p>A new task has been created in project <strong>${projectName}</strong>:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #9b59b6; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${taskName}</h3>
            <p><strong>Description:</strong> ${taskDetails.description || 'No description provided'}</p>
            <p><strong>Due Date:</strong> ${taskDetails.dueDate || 'Not specified'}</p>
            <p><strong>Priority:</strong> ${taskDetails.priority || 'Normal'}</p>
          </div>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #7f8c8d;">
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    `
  }),

  // Enhanced deadline approaching template
  deadlineApproaching: (type, name, dueDate) => ({
    subject: `⏰ Deadline Approaching: ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #e67e22;">Deadline Approaching</h2>
        </div>
        <div style="margin-bottom: 20px;">
          <p>The following ${type} is approaching its deadline:</p>
          <div style="background-color: #fef9e7; padding: 15px; border-left: 4px solid #f39c12; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0; color: #d35400;">${name}</h3>
            <p><strong>Due Date:</strong> ${dueDate}</p>
          </div>
          <p>Please take necessary actions to ensure timely completion.</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #7f8c8d;">
          <p>This is an automated reminder. Please do not reply to this email.</p>
        </div>
      </div>
    `
  })
};

// Function to send email
const sendEmail = async (to, emailContent) => {
  try {
    if (!to) {
      console.error('No recipient email address provided');
      return { success: false, error: 'No recipient email address provided' };
    }

    const mailOptions = {
      from: `"Project Management Tool" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Helper functions for specific email types
const sendWelcomeEmail = async (email, name) => {
  const emailContent = emailTemplates.welcome(name);
  return sendEmail(email, emailContent);
};

const sendProjectAssignmentEmail = async (email, projectName, assignerName, projectId) => {
  const emailContent = emailTemplates.projectAssignment(projectName, assignerName, projectId);
  return sendEmail(email, emailContent);
};

module.exports = {
  sendEmail,
  emailTemplates
}; 
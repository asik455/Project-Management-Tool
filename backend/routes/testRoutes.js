const express = require('express');
const router = express.Router();
const { sendWelcomeEmail, sendProjectAssignmentEmail } = require('../services/emailService');

// Test welcome email
router.get('/test-welcome-email', async (req, res) => {
  try {
    const email = 'recipient@example.com'; // Replace with recipient email
    const name = 'Test User';
    
    console.log(`Sending test welcome email to ${email}`);
    const result = await sendWelcomeEmail(email, name);
    
    if (result.success) {
      console.log('Welcome email sent successfully');
      res.json({ success: true, message: 'Welcome email sent successfully' });
    } else {
      console.error('Failed to send welcome email:', result.error);
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in test-welcome-email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test project assignment email
router.get('/test-assignment-email', async (req, res) => {
  try {
    const email = 'recipient@example.com'; // Replace with recipient email
    const projectName = 'Test Project';
    const assignerName = 'Manager Name';
    const projectId = '12345';
    
    console.log(`Sending test assignment email to ${email}`);
    const result = await sendProjectAssignmentEmail(email, projectName, assignerName, projectId);
    
    if (result.success) {
      console.log('Assignment email sent successfully');
      res.json({ success: true, message: 'Assignment email sent successfully' });
    } else {
      console.error('Failed to send assignment email:', result.error);
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in test-assignment-email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

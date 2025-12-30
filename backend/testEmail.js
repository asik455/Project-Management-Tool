const { sendEmail } = require('./utils/emailService');

async function main() {
  const result = await sendEmail(
    'kasik7868@gmail.com',
    'newProject',
    ['Test Project', { description: 'This is a test email', dueDate: '2025-12-31', team: 1 }]
  );
  console.log('Test email result:', result);
  process.exit(0);
}

main(); 
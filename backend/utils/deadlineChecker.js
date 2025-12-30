const { sendEmail } = require('./emailService');

// Function to check if a date is within the notification window
const isWithinNotificationWindow = (dueDate, daysThreshold = 3) => {
  const now = new Date();
  const deadline = new Date(dueDate);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= daysThreshold;
};

// Function to check project deadlines
const checkProjectDeadlines = async (projects) => {
  for (const project of projects) {
    if (project.dueDate && isWithinNotificationWindow(project.dueDate)) {
      try {
        await project.populate('team');
        if (project.team && project.team.length > 0) {
          await sendEmail(
            project.team.map(member => member.email),
            'deadlineApproaching',
            ['project', project.name, project.dueDate]
          );
        }
      } catch (error) {
        console.error('Error checking project deadline:', error);
      }
    }
  }
};

// Function to check task deadlines
const checkTaskDeadlines = async (tasks) => {
  for (const task of tasks) {
    if (task.dueDate && isWithinNotificationWindow(task.dueDate)) {
      try {
        await task.populate('assignedTo');
        if (task.assignedTo && task.assignedTo.length > 0) {
          await sendEmail(
            task.assignedTo.map(member => member.email),
            'deadlineApproaching',
            ['task', task.title, task.dueDate]
          );
        }
      } catch (error) {
        console.error('Error checking task deadline:', error);
      }
    }
  }
};

module.exports = {
  isWithinNotificationWindow,
  checkProjectDeadlines,
  checkTaskDeadlines
}; 
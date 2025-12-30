const Task = require('../models/Task');
const Project = require('../models/Project');
const { sendEmail } = require('../utils/emailService');
const User = require('../models/User');

exports.getTasks = async (req, res) => {
  try {
    const { project } = req.query;
    let filter = {};
    if (project) {
      filter.project = project;
    }
    // Only tasks in projects user can access
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id },
      ],
    });
    const allowedProjectIds = projects.map(p => p._id);
    filter.project = filter.project || { $in: allowedProjectIds };
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found.' });
    // Check project access
    const project = await Project.findById(task.project);
    if (!project.owner.equals(req.user._id) && !project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignee, project, tags } = req.body;
    // Check project access
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found.' });
    if (!proj.owner.equals(req.user._id) && !proj.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      assignee,
      project,
      tags,
    });
    await task.save();

    // Get assignee's email
    const assigneeUser = await User.findById(assignee);
    if (assigneeUser) {
      await sendEmail(
        assigneeUser.email,
        'newTask',
        [task.title, proj.name, {
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority
        }]
      );
    }

    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found.' });
    // Check project access
    const project = await Project.findById(task.project);
    if (!project.owner.equals(req.user._id) && !project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found.' });
    // Check project access
    const project = await Project.findById(task.project);
    if (!project.owner.equals(req.user._id) && !project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    await task.deleteOne();
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 
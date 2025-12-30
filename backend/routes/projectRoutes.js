const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/authMiddleware');
const projectController = require('../controllers/projectController');

// Project assignment route
router.post('/:projectId/team/:userId', auth, projectController.assignUserToProject);

// Get all projects for the authenticated user
router.get('/', auth, projectController.getProjects);

// Get a single project by ID
router.get('/:id', auth, projectController.getProject);

// Create a new project
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received project creation request with data:', {
      body: req.body,
      user: req.user
    });

    const { name, description, dueDate, teamMembers = [], status, progress = 0 } = req.body;
    
    // Validate required fields
    if (!name) {
      console.error('Validation error: Project name is required');
      return res.status(400).json({ message: 'Project name is required' });
    }

    if (!dueDate) {
      console.error('Validation error: Due date is required');
      return res.status(400).json({ message: 'Due date is required' });
    }
    
    const projectData = {
      name,
      description,
      dueDate: new Date(dueDate), // Ensure proper date format
      status: status || 'on-track',
      progress: Math.min(100, Math.max(0, Number(progress))), // Ensure progress is between 0-100
      owner: req.user.id,
      teamMembers: Array.isArray(teamMembers) ? teamMembers : []
    };

    console.log('Creating project with data:', projectData);
    
    const project = new Project(projectData);
    await project.save();
    
    console.log('Project created successfully:', project);
    
    // Populate the owner and team members in the response
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('teamMembers', 'name email');
    
    console.log('Sending response with populated project');
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    res.status(500).json({ 
      message: 'Error creating project', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('teamMembers', 'name email role');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is the owner or a team member
    if (project.owner._id.toString() !== req.user.id && 
        !project.teamMembers.some(member => member._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      message: 'Error fetching project', 
      error: error.message 
    });
  }
});

// Update a project
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, dueDate, teamMembers, status, progress } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    project.name = name || project.name;
    project.description = description || project.description;
    project.dueDate = dueDate || project.dueDate;
    project.teamMembers = teamMembers || project.teamMembers;
    project.status = status || project.status;
    project.progress = Math.min(100, Math.max(0, progress)) || project.progress;
    
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: 'Error updating project', error: error.message });
  }
});

// Delete a project
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('DELETE PROJECT REQUEST:', {
      projectId: req.params.id,
      userId: req.user.id,
      userEmail: req.user.email
    });

    const project = await Project.findById(req.params.id);

    if (!project) {
      console.log('Project not found:', req.params.id);
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log('Project found:', {
      projectId: project._id,
      ownerId: project.owner,
      ownerIdString: project.owner.toString(),
      userId: req.user.id
    });

    // Check if user is the owner
    if (project.owner.toString() !== req.user.id) {
      console.log('User is not the owner, denying deletion');
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    } else {
      console.log('User is the owner, allowing deletion');
    }

    await project.deleteOne();
    console.log('Project deleted successfully');
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      message: 'Error deleting project',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

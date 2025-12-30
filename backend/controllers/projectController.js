const Project = require('../models/Project');
const User = require('../models/User');
const { sendProjectAssignmentEmail } = require('../services/emailService');

// Assign user to project
exports.assignUserToProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const assignerId = req.user.id;

    // Get project and user details
    const project = await Project.findById(projectId);
    const assigner = await User.findById(assignerId);
    const assignee = await User.findById(userId);

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    if (!assignee) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if user is already in the project
    if (project.team && project.team.includes(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'User is already assigned to this project' 
      });
    }

    // Add user to project team if team array exists, otherwise create it
    if (!project.team) {
      project.team = [];
    }
    project.team.push(userId);
    await project.save();

    // Send email notification
    await sendProjectAssignmentEmail(
      assignee.email,
      project.name,
      assigner.name,
      project._id.toString()
    ).catch(error => {
      console.error('Failed to send project assignment email:', error);
    });

    res.status(200).json({
      success: true,
      message: 'User assigned to project successfully',
      data: {
        projectId: project._id,
        userId: assignee._id,
        userName: assignee.name,
        userEmail: assignee.email
      }
    });
  } catch (error) {
    console.error('Error assigning user to project:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all projects (any authenticated user can view all projects)
exports.getProjects = async (req, res) => {
  try {
    console.log('Fetching all projects for user:', req.user._id);
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .populate('owner', 'name email');
    
    console.log(`Found ${projects.length} projects`);
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      message: 'Error fetching projects',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Get a single project by ID with team members populated
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only the owner can view the project
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    
    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ message: 'Error fetching project' });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  console.log('=== CREATE PROJECT REQUEST ===');
  console.log('Authenticated user:', {
    _id: req.user?._id,
    email: req.user?.email,
    name: req.user?.name
  });
  console.log('Request body:', req.body);
  
  try {
    const { name, description, dueDate, status, progress = 0 } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      console.log('Validation failed: Project name is required');
      return res.status(400).json({ message: 'Project name is required' });
    }

    if (!dueDate) {
      console.log('Validation failed: Due date is required');
      return res.status(400).json({ message: 'Due date is required' });
    }
    
    // Create project data
    const projectData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      dueDate: new Date(dueDate),
      status: status || 'on-track',
      progress: Math.min(100, Math.max(0, Number(progress))),
      owner: req.user._id
    };

    console.log('Creating project with data:', projectData);
    
    // Create and save project
    const project = new Project(projectData);
    await project.save();
    
    console.log('Project created successfully:', project);
    
    // Populate owner details in the response
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email');
    
    console.log('Sending response with populated project');
    res.status(201).json(populatedProject);
  } catch (err) {
    console.error('Error creating project:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue
    });
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      return res.status(400).json({ 
        message: `${field} '${value}' is already in use`
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating project', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const { name, description, dueDate, status, progress } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only the owner can update the project
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    // Update project fields if provided
    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (dueDate) project.dueDate = new Date(dueDate);
    if (status) project.status = status;
    if (progress !== undefined) project.progress = Math.min(100, Math.max(0, Number(progress)));
    
    project.updatedAt = Date.now();
    await project.save();
    
    // Populate owner details in the response
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email');
    
    res.json(populatedProject);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ 
      message: 'Error updating project', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only the owner can delete the project
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    
    await project.remove();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ 
      message: 'Error deleting project', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};
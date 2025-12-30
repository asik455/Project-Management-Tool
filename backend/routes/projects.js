const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

// Project routes - all require authentication
// Allow any authenticated user to create and view projects
router.post('/', auth, createProject);
router.get('/', auth, getProjects);
router.get('/:id', auth, getProject);

// Only allow owners to update or delete their projects
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);

module.exports = router;
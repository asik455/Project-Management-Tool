const express = require('express');
const router = express.Router();
const { createTeam, joinTeam, getTeamMembers, leaveTeam } = require('../controllers/teamController');
const auth = require('../middleware/authMiddleware');

router.post('/create', auth, createTeam);
router.post('/join', auth, joinTeam);
router.get('/:teamId/members', auth, getTeamMembers);
router.post('/leave', auth, leaveTeam);

module.exports = router;

const Team = require('../models/Team');
const User = require('../models/User');
const Project = require('../models/Project');

// Create a new team for a project
exports.createTeam = async (req, res) => {
  try {
    const { name, projectId } = req.body;
    const userId = req.user.id;

    // Generate unique access code
    const accessCode = Team.generateAccessCode();

    const team = new Team({
      name,
      accessCode,
      project: projectId,
      createdBy: userId,
      members: [userId]
    });

    await team.save();

    // Update user's team information
    await User.findByIdAndUpdate(userId, {
      teamCode: accessCode,
      teamName: name,
      $addToSet: { projects: projectId },
      isTeamMember: true
    });

    res.status(201).json({
      team: {
        id: team._id,
        name: team.name,
        accessCode: team.accessCode,
        project: team.project
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating team.' });
  }
};

// Join team using access code
exports.joinTeam = async (req, res) => {
  try {
    const { accessCode } = req.body;
    const userId = req.user.id;

    const team = await Team.findOne({ accessCode }).populate('project');
    if (!team) {
      return res.status(404).json({ message: 'Invalid team access code.' });
    }

    // Check if user is already in a team
    const user = await User.findById(userId);
    if (user.isTeamMember) {
      return res.status(400).json({ message: 'You are already part of a team.' });
    }

    // Add user to team
    await Team.findByIdAndUpdate(team._id, {
      $addToSet: { members: userId }
    });

    // Update user's team information
    await User.findByIdAndUpdate(userId, {
      teamCode: accessCode,
      teamName: team.name,
      $addToSet: { projects: team.project._id },
      isTeamMember: true
    });

    res.status(200).json({
      message: 'Successfully joined team.',
      team: {
        id: team._id,
        name: team.name,
        project: team.project
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error joining team.' });
  }
};

// Get team members
exports.getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await Team.findById(teamId)
      .populate('members', 'name email role')
      .populate('project', 'name description');

    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    res.status(200).json({ team });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching team members.' });
  }
};

// Leave team
exports.leaveTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user.isTeamMember) {
      return res.status(400).json({ message: 'You are not part of any team.' });
    }

    const team = await Team.findOne({ accessCode: user.teamCode });
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    // Remove user from team
    await Team.findByIdAndUpdate(team._id, {
      $pull: { members: userId }
    });

    // Update user's team information
    await User.findByIdAndUpdate(userId, {
      teamCode: null,
      teamName: null,
      $pull: { projects: team.project },
      isTeamMember: false
    });

    res.status(200).json({ message: 'Successfully left team.' });
  } catch (err) {
    res.status(500).json({ message: 'Error leaving team.' });
  }
};

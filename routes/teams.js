const express = require('express');
const { db } = require('../config/firebase');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Apply JWT middleware to all team routes
router.use(authenticateToken);

// Create a new team
router.post('/', async (req, res) => {
  try {
    const { name, description, color, businessId } = req.body;
    const userId = req.user.userId; // From JWT middleware

    const teamData = {
      name,
      description,
      businessId,
      color,
      memberIds: [userId],
      teamLeadIds: [userId],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const teamRef = await db.collection('teams').add(teamData);
    
    res.json({
      success: true,
      teamId: teamRef.id,
      team: { ...teamData, id: teamRef.id }
    });
    // Test this: You'll see {"success": true, "teamId": "abc123"} in Thunder Client
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's teams
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT middleware
    
    const teamsSnapshot = await db.collection('teams')
      .where('memberIds', 'array-contains', userId)
      .get();

    const teams = [];
    teamsSnapshot.forEach(doc => {
      teams.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, teams });
    // Test this: You'll see list of teams in Thunder Client
  } catch (error) {
    console.error('Error getting teams:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get team members
router.get('/:teamId/members', async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.userId;

    // Verify user is a member of this team
    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    const teamData = teamDoc.data();
    if (!teamData.memberIds.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Get all team members' user data
    const memberIds = teamData.memberIds;
    const teamLeadIds = teamData.teamLeadIds;
    
    const members = [];
    for (const memberId of memberIds) {
      const userDoc = await db.collection('users').doc(memberId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        members.push({
          id: memberId,
          name: userData.name,
          email: userData.email,
          timezone: userData.timezone || 'UTC',
          isActive: userData.isActive !== false,
          profileImage: userData.profileImage,
          isAdmin: teamLeadIds.includes(memberId),
          role: teamLeadIds.includes(memberId) ? 'Admin' : 'Member'
        });
      }
    }

    res.json({ success: true, members });
  } catch (error) {
    console.error('Error getting team members:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add member to team
router.post('/:teamId/members', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, isAdmin = false } = req.body;
    const userId = req.user.userId;

    // Verify user is an admin of this team
    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    const teamData = teamDoc.data();
    if (!teamData.teamLeadIds.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Only team admins can add members' });
    }

    // Find user by email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userDoc = usersSnapshot.docs[0];
    const newMemberId = userDoc.id;

    // Check if user is already a member
    if (teamData.memberIds.includes(newMemberId)) {
      return res.status(400).json({ success: false, error: 'User is already a team member' });
    }

    // Add user to team
    const updatedMemberIds = [...teamData.memberIds, newMemberId];
    let updatedTeamLeadIds = teamData.teamLeadIds;
    
    if (isAdmin) {
      updatedTeamLeadIds = [...teamData.teamLeadIds, newMemberId];
    }

    await db.collection('teams').doc(teamId).update({
      memberIds: updatedMemberIds,
      teamLeadIds: updatedTeamLeadIds,
      updatedAt: new Date()
    });

    res.json({ success: true, message: 'Member added successfully' });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove member from team
router.delete('/:teamId/members/:memberId', async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const userId = req.user.userId;

    // Verify user is an admin of this team
    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    const teamData = teamDoc.data();
    if (!teamData.teamLeadIds.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Only team admins can remove members' });
    }

    // Prevent removing the last admin
    if (teamData.teamLeadIds.includes(memberId) && teamData.teamLeadIds.length === 1) {
      return res.status(400).json({ success: false, error: 'Cannot remove the last team admin' });
    }

    // Remove user from team
    const updatedMemberIds = teamData.memberIds.filter(id => id !== memberId);
    const updatedTeamLeadIds = teamData.teamLeadIds.filter(id => id !== memberId);

    await db.collection('teams').doc(teamId).update({
      memberIds: updatedMemberIds,
      teamLeadIds: updatedTeamLeadIds,
      updatedAt: new Date()
    });

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update member role
router.put('/:teamId/members/:memberId/role', async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { isAdmin } = req.body;
    const userId = req.user.userId;

    // Verify user is an admin of this team
    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    const teamData = teamDoc.data();
    if (!teamData.teamLeadIds.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Only team admins can change member roles' });
    }

    // Prevent changing role of the last admin
    if (teamData.teamLeadIds.includes(memberId) && teamData.teamLeadIds.length === 1 && !isAdmin) {
      return res.status(400).json({ success: false, error: 'Cannot remove the last team admin' });
    }

    let updatedTeamLeadIds = teamData.teamLeadIds;
    
    if (isAdmin) {
      if (!updatedTeamLeadIds.includes(memberId)) {
        updatedTeamLeadIds = [...updatedTeamLeadIds, memberId];
      }
    } else {
      updatedTeamLeadIds = updatedTeamLeadIds.filter(id => id !== memberId);
    }

    await db.collection('teams').doc(teamId).update({
      teamLeadIds: updatedTeamLeadIds,
      updatedAt: new Date()
    });

    res.json({ success: true, message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
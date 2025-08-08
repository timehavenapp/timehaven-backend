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

module.exports = router;
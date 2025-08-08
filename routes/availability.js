const express = require('express');
const { db } = require('../config/firebase');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Apply JWT middleware to all availability routes
router.use(authenticateToken);

// Get availability heatmap for a team
router.get('/heatmap/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD

    // Get all team members
    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamDoc.data();
    const memberIds = team.memberIds;

    // Get availability for all members on the specified date
    const availabilitySnapshot = await db.collection('availability')
      .where('teamId', '==', teamId)
      .where('date', '==', date)
      .get();

    const availabilityData = {};
    availabilitySnapshot.forEach(doc => {
      const data = doc.data();
      availabilityData[data.userId] = data.availability;
    });

    // Calculate heatmap data
    const heatmap = {};
    for (let hour = 0; hour < 24; hour++) {
      let availableCount = 0;
      let totalCount = memberIds.length;

      memberIds.forEach(memberId => {
        if (availabilityData[memberId] && availabilityData[memberId][hour]) {
          availableCount++;
        }
      });

      heatmap[hour] = {
        available: availableCount,
        total: totalCount,
        percentage: totalCount > 0 ? availableCount / totalCount : 0
      };
    }

    res.json({ success: true, heatmap });
    // Test this: You'll see heatmap data in Thunder Client
  } catch (error) {
    console.error('Error getting heatmap:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user availability
router.put('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { date, availability } = req.body;
    const userId = req.user.userId; // From JWT middleware

    const availabilityRef = db.collection('availability').doc(`${userId}_${teamId}_${date}`);
    
    await availabilityRef.set({
      userId,
      teamId,
      date,
      availability,
      updatedAt: new Date()
    });

    res.json({ success: true });
    // Test this: You'll see {"success": true} in Thunder Client
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
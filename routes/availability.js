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

// Get user's calendar events for availability calculation
router.get('/calendar/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD
    const userId = req.user.userId;

    // Get user's calendar provider and tokens
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const calendarProvider = userData.calendarProvider;

    if (!calendarProvider) {
      return res.json({ success: true, events: [] });
    }

    let events = [];
    
    if (calendarProvider === 'google' && userData.googleAccessToken) {
      // Fetch Google Calendar events
      events = await fetchGoogleCalendarEvents(userData.googleAccessToken, date);
    } else if (calendarProvider === 'outlook' && userData.outlookAccessToken) {
      // Fetch Outlook Calendar events
      events = await fetchOutlookCalendarEvents(userData.outlookAccessToken, date);
    }

    res.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to fetch Google Calendar events
async function fetchGoogleCalendarEvents(accessToken, date) {
  try {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}&singleEvents=true&orderBy=startTime`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.items || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    return [];
  }
}

// Helper function to fetch Outlook Calendar events
async function fetchOutlookCalendarEvents(accessToken, date) {
  try {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const url = `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${startDate.toISOString()}&endDateTime=${endDate.toISOString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.value || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Outlook Calendar events:', error);
    return [];
  }
}

module.exports = router;
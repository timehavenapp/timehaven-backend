   const { db } = require('../config/firebase');

   // Helper function to add a user
   async function createUser(userData) {
     try {
       const userRef = db.collection('users').doc(userData.id);
       await userRef.set({
         ...userData,
         createdAt: new Date(),
         updatedAt: new Date()
       });
       return { success: true, userId: userData.id };
     } catch (error) {
       console.error('Error creating user:', error);
       return { success: false, error: error.message };
     }
   }

   // Helper function to get a user
   async function getUser(userId) {
     try {
       const userDoc = await db.collection('users').doc(userId).get();
       if (userDoc.exists) {
         return { success: true, user: userDoc.data() };
       } else {
         return { success: false, error: 'User not found' };
       }
     } catch (error) {
       console.error('Error getting user:', error);
       return { success: false, error: error.message };
     }
   }

   module.exports = { createUser, getUser };
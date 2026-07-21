const express = require('express');
const User = require('../models/User');
const Session = require('../models/Session');
const Image = require('../models/Image');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Get all users, with session history and image stats
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    
    // Map data for admin dashboard
    const mappedUsers = await Promise.all(users.map(async (user) => {
      const totalImages = await Image.countDocuments({ userId: user._id });
      const sessions = await Session.find({ userId: user._id }).sort({ lastActive: -1 }).limit(5).lean();
      
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        totalImages,
        sessions: sessions.map(s => ({
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
          lastActive: s.lastActive
        }))
      };
    }));

    res.json(mappedUsers);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;

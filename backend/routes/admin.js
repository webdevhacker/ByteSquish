const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all users, with session history and image stats
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        sessions: {
          orderBy: { lastActive: 'desc' },
          take: 5 // Get last 5 sessions
        },
        _count: {
          select: { images: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map data for admin dashboard
    const mappedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      totalImages: user._count.images,
      sessions: user.sessions.map(s => ({
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        lastActive: s.lastActive
      }))
    }));

    res.json(mappedUsers);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;

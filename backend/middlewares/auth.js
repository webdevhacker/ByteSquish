const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkSession = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.sessionId) {
      const session = await prisma.session.findUnique({ 
        where: { id: decoded.sessionId },
        include: { user: true }
      });
      if (session && session.user) {
        return { userId: session.userId, sessionId: session.id, isAdmin: session.user.isAdmin };
      }
    } else {
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user) {
        return { userId: decoded.userId, isAdmin: user.isAdmin };
      }
    }
  } catch (err) {
    return null;
  }
  return null;
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    req.user = await checkSession(token);
  } else {
    req.user = null;
  }
  next();
};

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = await checkSession(token);
    if (user) {
      req.user = user;
      return next();
    } else {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
  }
  return res.status(401).json({ error: 'Authentication required' });
};

const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = await checkSession(token);
    if (user && user.isAdmin) {
      req.user = user;
      return next();
    } else {
      return res.status(403).json({ error: 'Admin access required' });
    }
  }
  return res.status(401).json({ error: 'Authentication required' });
};

module.exports = { optionalAuth, requireAuth, authenticateToken: requireAuth, requireAdmin };

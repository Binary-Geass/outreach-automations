const { protectRoute, getUser } = require('@kinde-oss/kinde-node-express');
const logger = require('../utils/logger');

// Middleware to verify authentication and attach user to request
const authenticate = [
  protectRoute,
  getUser,
  (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn('Authentication failed: No user found in request');
        return res.status(401).json({ 
          status: 'error',
          message: 'Authentication required' 
        });
      }
      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      return res.status(500).json({ 
        status: 'error',
        message: 'Internal server error during authentication' 
      });
    }
  }
];

// Middleware to check specific permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    try {
      const userPermissions = req.user.permissions || [];
      if (!userPermissions.includes(permission)) {
        logger.warn(`Permission denied: User ${req.user.id} attempted to access ${permission}`);
        return res.status(403).json({ 
          status: 'error',
          message: 'Permission denied' 
        });
      }
      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({ 
        status: 'error',
        message: 'Internal server error during permission check' 
      });
    }
  };
};

// Middleware to check organization access
const checkOrganization = async (req, res, next) => {
  try {
    const orgId = req.params.orgId || req.body.orgId;
    if (!orgId) {
      logger.warn('Organization check failed: No organization ID provided');
      return res.status(400).json({ 
        status: 'error',
        message: 'Organization ID is required' 
      });
    }

    const userOrgs = req.user.organizations || [];
    if (!userOrgs.includes(orgId)) {
      logger.warn(`Organization access denied: User ${req.user.id} attempted to access org ${orgId}`);
      return res.status(403).json({ 
        status: 'error',
        message: 'Access to this organization denied' 
      });
    }
    next();
  } catch (error) {
    logger.error('Organization check error:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error during organization check' 
    });
  }
};

module.exports = {
  authenticate,
  checkPermission,
  checkOrganization
}; 
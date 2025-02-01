const express = require('express');
const { authenticate, checkPermission } = require('../middleware/auth');
const userController = require('../controllers/user.controller');
const { body } = require('express-validator');

const router = express.Router();

// Middleware to validate profile updates
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Protected routes
router.use(authenticate);

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Update user profile
router.patch('/me', validateProfileUpdate, userController.updateProfile);

// Get user's organizations
router.get('/me/organizations', userController.getUserOrganizations);

// Get user's permissions
router.get('/me/permissions', userController.getUserPermissions);

// Delete account
router.delete('/me', userController.deleteAccount);

// Admin routes
router.patch(
  '/status/:userId',
  checkPermission('manage:users'),
  body('status')
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Invalid status value'),
  userController.updateUserStatus
);

module.exports = router; 
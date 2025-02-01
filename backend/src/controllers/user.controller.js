const User = require('../models/user.model');
const { AppError } = require('../middleware/error');
const logger = require('../utils/logger');

// Get current user profile
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findOrCreateFromKinde(req.user);
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Error getting current user:', error);
    return next(new AppError('Error fetching user profile', 500));
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'metadata'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return next(new AppError('No valid update fields provided', 400));
    }
    
    const user = await User.findOneAndUpdate(
      { kindeId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    return next(new AppError('Error updating profile', 500));
  }
};

// Get user's organizations
exports.getUserOrganizations = async (req, res, next) => {
  try {
    const user = await User.findOne({ kindeId: req.user.id });
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        organizations: user.organizations
      }
    });
  } catch (error) {
    logger.error('Error fetching user organizations:', error);
    return next(new AppError('Error fetching organizations', 500));
  }
};

// Update user status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return next(new AppError('Invalid status value', 400));
    }
    
    const user = await User.findOneAndUpdate(
      { kindeId: req.params.userId },
      { status },
      { new: true }
    );
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Error updating user status:', error);
    return next(new AppError('Error updating user status', 500));
  }
};

// Delete user account
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ kindeId: req.user.id });
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // TODO: Implement Kinde user deletion if needed
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Error deleting user account:', error);
    return next(new AppError('Error deleting account', 500));
  }
};

// Get user permissions
exports.getUserPermissions = async (req, res, next) => {
  try {
    const user = await User.findOne({ kindeId: req.user.id });
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        permissions: user.permissions
      }
    });
  } catch (error) {
    logger.error('Error fetching user permissions:', error);
    return next(new AppError('Error fetching permissions', 500));
  }
}; 
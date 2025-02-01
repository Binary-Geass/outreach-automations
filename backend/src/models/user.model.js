const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  kindeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  organizations: [{
    type: String,
    ref: 'Organization'
  }],
  permissions: [{
    type: String
  }],
  metadata: {
    type: Map,
    of: String
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ kindeId: 1 });
userSchema.index({ organizations: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified()) return next();
  
  // Additional pre-save operations can be added here
  
  next();
});

// Static method to find or create user from Kinde data
userSchema.statics.findOrCreateFromKinde = async function(kindeUser) {
  try {
    let user = await this.findOne({ kindeId: kindeUser.id });
    
    if (!user) {
      user = await this.create({
        kindeId: kindeUser.id,
        email: kindeUser.email,
        firstName: kindeUser.given_name,
        lastName: kindeUser.family_name,
        permissions: kindeUser.permissions || [],
        organizations: kindeUser.org_codes || []
      });
    } else {
      // Update user data if changed in Kinde
      user.email = kindeUser.email;
      user.firstName = kindeUser.given_name;
      user.lastName = kindeUser.family_name;
      user.permissions = kindeUser.permissions || [];
      user.organizations = kindeUser.org_codes || [];
      user.lastLogin = new Date();
      
      await user.save();
    }
    
    return user;
  } catch (error) {
    throw new Error(`Error in findOrCreateFromKinde: ${error.message}`);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 
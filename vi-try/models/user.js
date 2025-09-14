import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: {
    type: String,
    required: false,
  },
  resetTokenExpires: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    default: '',
    required: false,
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.svg',
    required: false,
  },
  tokens: {
    type: Number,
    default: 0,
  },
  subscription: {
    stripeSubscriptionId: { type: String, default: null }, // Store Stripe subscription ID
    package: { type: String, enum: ['Basic', 'Standard', 'Premium', 'Pro', 'Enterprise'], default: null }, // Package type
    status: { type: String, enum: ['active', 'inactive', 'canceled', 'trialing', 'past_due', 'expired'], default: 'inactive' }, // More accurate status tracking
    expiresAt: { type: Date, default: null }, // Expiry date
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
    },
    language: { type: String, default: 'English' },
    currency: { type: String, default: 'PKR' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

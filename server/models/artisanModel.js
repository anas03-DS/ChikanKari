const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const artisanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    specialty: {
      type: String,
      required: [true, 'Please specify your specialty'],
    },
    specialtyCategory: {
      type: String,
      enum: ['kurta', 'saree', 'dupatta', 'home-decor', 'accessories'],
      required: [true, 'Please select a specialty category'],
    },
    bio: {
      type: String,
      required: [true, 'Please add a bio'],
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please add your location'],
    },
    locationCategory: {
      type: String,
      enum: ['lucknow', 'varanasi', 'jaipur', 'delhi', 'other'],
      required: [true, 'Please select a location category'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    image: {
      type: String,
      default: 'images/placeholder.jpg',
    },
    coverImage: {
      type: String,
      default: 'images/placeholder.jpg',
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    customers: {
      type: Number,
      default: 0,
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for products
artisanSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'artisan',
  justOne: false,
  count: true,
});

// Encrypt password using bcrypt
artisanSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
artisanSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: 'artisan' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match artisan entered password to hashed password in database
artisanSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Artisan', artisanSchema); 
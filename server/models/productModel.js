const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Artisan',
    },
    image: {
      type: String,
      required: [true, 'Please add at least one product image'],
    },
    additionalImages: [String],
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a product category'],
      enum: ['kurta', 'saree', 'dupatta', 'home-decor', 'accessories'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be greater than 0'],
    },
    countInStock: {
      type: Number,
      required: [true, 'Please add stock count'],
      default: 0,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    material: {
      type: String,
      required: [true, 'Please specify the material'],
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inches'],
        default: 'cm',
      },
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['g', 'kg'],
        default: 'g',
      },
    },
    colors: [String],
    sizes: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tags: [String],
    shippingTime: {
      type: String,
      default: '5-7 business days',
    },
    returnable: {
      type: Boolean,
      default: true,
    },
    returnPeriod: {
      type: Number,
      default: 7,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate average rating when reviews are modified
productSchema.pre('save', function (next) {
  if (this.reviews.length > 0) {
    this.rating =
      this.reviews.reduce((acc, item) => item.rating + acc, 0) /
      this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema); 
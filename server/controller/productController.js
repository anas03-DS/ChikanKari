const Product = require('../models/productModel');
const Artisan = require('../models/artisanModel');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Artisan
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      countInStock,
      material,
      dimensions,
      weight,
      colors,
      sizes,
      tags,
      shippingTime,
      returnable,
      returnPeriod,
    } = req.body;

    // Create product with artisan ID from authenticated user
    const product = new Product({
      name,
      artisan: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : 'images/placeholder.jpg',
      description,
      category,
      price,
      countInStock,
      material,
      dimensions,
      weight,
      colors: colors ? colors.split(',').map(color => color.trim()) : [],
      sizes: sizes ? sizes.split(',').map(size => size.trim()) : [],
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      shippingTime,
      returnable,
      returnPeriod,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Artisan
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      countInStock,
      material,
      dimensions,
      weight,
      colors,
      sizes,
      tags,
      shippingTime,
      returnable,
      returnPeriod,
      isFeatured,
      discount,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if artisan owns this product
    if (product.artisan.toString() !== req.user._id.toString() && req.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price || product.price;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.material = material || product.material;
    
    if (dimensions) {
      product.dimensions = {
        ...product.dimensions,
        ...dimensions,
      };
    }
    
    if (weight) {
      product.weight = {
        ...product.weight,
        ...weight,
      };
    }
    
    if (colors) {
      product.colors = colors.split(',').map(color => color.trim());
    }
    
    if (sizes) {
      product.sizes = sizes.split(',').map(size => size.trim());
    }
    
    if (tags) {
      product.tags = tags.split(',').map(tag => tag.trim());
    }
    
    product.shippingTime = shippingTime || product.shippingTime;
    product.returnable = returnable !== undefined ? returnable : product.returnable;
    product.returnPeriod = returnPeriod || product.returnPeriod;
    
    // Admin-only fields
    if (req.userType === 'admin') {
      product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
      product.discount = discount !== undefined ? discount : product.discount;
    }

    // Update image if provided
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add additional product images
// @route   POST /api/products/:id/images
// @access  Private/Artisan
exports.addProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if artisan owns this product
    if (product.artisan.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      product.additionalImages = [...product.additionalImages, ...newImages];
      await product.save();
      
      res.json({
        message: 'Images uploaded successfully',
        additionalImages: product.additionalImages,
      });
    } else {
      res.status(400).json({ message: 'No images uploaded' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;
    
    // Build filter object
    const filters = {};
    
    // Search by keyword
    if (req.query.keyword) {
      filters.$or = [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.keyword, 'i')] } },
      ];
    }
    
    // Filter by category
    if (req.query.category) {
      filters.category = req.query.category;
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};
      if (req.query.minPrice) {
        filters.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filters.price.$lte = Number(req.query.maxPrice);
      }
    }
    
    // Filter by artisan location
    if (req.query.location) {
      // First find artisans from this location
      const artisans = await Artisan.find({ locationCategory: req.query.location }).select('_id');
      const artisanIds = artisans.map(artisan => artisan._id);
      filters.artisan = { $in: artisanIds };
    }
    
    // Filter by specific artisan
    if (req.query.artisan) {
      filters.artisan = req.query.artisan;
    }
    
    // Count documents
    const count = await Product.countDocuments(filters);
    
    // Sort options
    let sortOption = {};
    switch (req.query.sort) {
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { rating: -1 };
        break;
      default:
        // Default sort: featured first, then newest
        sortOption = { isFeatured: -1, createdAt: -1 };
    }
    
    // Get products
    const products = await Product.find(filters)
      .populate('artisan', 'name location image')
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate('artisan', 'name location image')
      .limit(8);
    
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('artisan', 'name specialty location image bio rating numReviews');
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get artisan's products
// @route   GET /api/products/artisan/:id
// @access  Public
exports.getArtisanProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;
    
    const count = await Product.countDocuments({ artisan: req.params.id });
    
    const products = await Product.find({ artisan: req.params.id })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Artisan/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if artisan owns this product or user is admin
    if (product.artisan.toString() !== req.user._id.toString() && req.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private/Customer
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    await product.save();

    // Update artisan rating
    const artisan = await Artisan.findById(product.artisan);
    if (artisan) {
      const artisanProducts = await Product.find({ artisan: artisan._id });
      
      // Calculate average rating across all products
      const totalRating = artisanProducts.reduce((acc, product) => acc + product.rating, 0);
      const averageRating = totalRating / artisanProducts.length;
      
      artisan.rating = averageRating;
      artisan.numReviews = artisanProducts.reduce((acc, product) => acc + product.numReviews, 0);
      
      await artisan.save();
    }

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
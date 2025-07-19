const Artisan = require('../models/artisanModel');
const Product = require('../models/productModel');

// @desc    Register a new artisan
// @route   POST /api/artisans
// @access  Public
exports.registerArtisan = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialty,
      specialtyCategory,
      bio,
      location,
      locationCategory,
      address,
      socialMedia,
      bankDetails,
    } = req.body;

    // Check if artisan already exists
    const artisanExists = await Artisan.findOne({ email });
    if (artisanExists) {
      return res.status(400).json({ message: 'Artisan already exists' });
    }

    // Create new artisan
    const artisan = await Artisan.create({
      name,
      email,
      password,
      phone,
      specialty,
      specialtyCategory,
      bio,
      location,
      locationCategory,
      address,
      socialMedia,
      bankDetails,
    });

    if (artisan) {
      res.status(201).json({
        _id: artisan._id,
        name: artisan.name,
        email: artisan.email,
        phone: artisan.phone,
        specialty: artisan.specialty,
        specialtyCategory: artisan.specialtyCategory,
        bio: artisan.bio,
        location: artisan.location,
        locationCategory: artisan.locationCategory,
        image: artisan.image,
        approved: artisan.approved,
        token: artisan.getSignedJwtToken(),
      });
    } else {
      res.status(400).json({ message: 'Invalid artisan data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth artisan & get token
// @route   POST /api/artisans/login
// @access  Public
exports.loginArtisan = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for artisan
    const artisan = await Artisan.findOne({ email }).select('+password');
    if (!artisan) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await artisan.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: artisan._id,
      name: artisan.name,
      email: artisan.email,
      phone: artisan.phone,
      specialty: artisan.specialty,
      specialtyCategory: artisan.specialtyCategory,
      bio: artisan.bio,
      location: artisan.location,
      locationCategory: artisan.locationCategory,
      image: artisan.image,
      approved: artisan.approved,
      token: artisan.getSignedJwtToken(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get artisan profile
// @route   GET /api/artisans/profile
// @access  Private/Artisan
exports.getArtisanProfile = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.user._id);

    if (artisan) {
      // Get product count
      const productCount = await Product.countDocuments({ artisan: artisan._id });

      res.json({
        _id: artisan._id,
        name: artisan.name,
        email: artisan.email,
        phone: artisan.phone,
        specialty: artisan.specialty,
        specialtyCategory: artisan.specialtyCategory,
        bio: artisan.bio,
        location: artisan.location,
        locationCategory: artisan.locationCategory,
        address: artisan.address,
        image: artisan.image,
        coverImage: artisan.coverImage,
        rating: artisan.rating,
        numReviews: artisan.numReviews,
        customers: artisan.customers,
        socialMedia: artisan.socialMedia,
        bankDetails: artisan.bankDetails,
        approved: artisan.approved,
        productCount,
      });
    } else {
      res.status(404).json({ message: 'Artisan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update artisan profile
// @route   PUT /api/artisans/profile
// @access  Private/Artisan
exports.updateArtisanProfile = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.user._id);

    if (artisan) {
      artisan.name = req.body.name || artisan.name;
      artisan.email = req.body.email || artisan.email;
      artisan.phone = req.body.phone || artisan.phone;
      artisan.specialty = req.body.specialty || artisan.specialty;
      artisan.specialtyCategory = req.body.specialtyCategory || artisan.specialtyCategory;
      artisan.bio = req.body.bio || artisan.bio;
      artisan.location = req.body.location || artisan.location;
      artisan.locationCategory = req.body.locationCategory || artisan.locationCategory;
      
      if (req.body.address) {
        artisan.address = {
          ...artisan.address,
          ...req.body.address,
        };
      }
      
      if (req.body.socialMedia) {
        artisan.socialMedia = {
          ...artisan.socialMedia,
          ...req.body.socialMedia,
        };
      }
      
      if (req.body.bankDetails) {
        artisan.bankDetails = {
          ...artisan.bankDetails,
          ...req.body.bankDetails,
        };
      }
      
      if (req.body.password) {
        artisan.password = req.body.password;
      }

      const updatedArtisan = await artisan.save();

      // Get product count
      const productCount = await Product.countDocuments({ artisan: artisan._id });

      res.json({
        _id: updatedArtisan._id,
        name: updatedArtisan.name,
        email: updatedArtisan.email,
        phone: updatedArtisan.phone,
        specialty: updatedArtisan.specialty,
        specialtyCategory: updatedArtisan.specialtyCategory,
        bio: updatedArtisan.bio,
        location: updatedArtisan.location,
        locationCategory: updatedArtisan.locationCategory,
        address: updatedArtisan.address,
        image: updatedArtisan.image,
        coverImage: updatedArtisan.coverImage,
        rating: updatedArtisan.rating,
        numReviews: updatedArtisan.numReviews,
        customers: updatedArtisan.customers,
        socialMedia: updatedArtisan.socialMedia,
        bankDetails: updatedArtisan.bankDetails,
        approved: updatedArtisan.approved,
        productCount,
        token: updatedArtisan.getSignedJwtToken(),
      });
    } else {
      res.status(404).json({ message: 'Artisan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload artisan profile image
// @route   POST /api/artisans/profile/image
// @access  Private/Artisan
exports.uploadArtisanImage = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.user._id);

    if (artisan) {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image' });
      }

      // Update artisan with image path
      artisan.image = `/uploads/${req.file.filename}`;
      await artisan.save();

      res.json({
        message: 'Image uploaded successfully',
        image: artisan.image,
      });
    } else {
      res.status(404).json({ message: 'Artisan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload artisan cover image
// @route   POST /api/artisans/profile/cover
// @access  Private/Artisan
exports.uploadArtisanCover = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.user._id);

    if (artisan) {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image' });
      }

      // Update artisan with cover image path
      artisan.coverImage = `/uploads/${req.file.filename}`;
      await artisan.save();

      res.json({
        message: 'Cover image uploaded successfully',
        coverImage: artisan.coverImage,
      });
    } else {
      res.status(404).json({ message: 'Artisan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all artisans
// @route   GET /api/artisans
// @access  Public
exports.getArtisans = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { specialty: { $regex: req.query.keyword, $options: 'i' } },
            { bio: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};
    
    const locationFilter = req.query.location
      ? { locationCategory: req.query.location }
      : {};
    
    const specialtyFilter = req.query.specialty
      ? { specialtyCategory: req.query.specialty }
      : {};
    
    const approvedFilter = { approved: true };
    
    const filters = {
      ...keyword,
      ...locationFilter,
      ...specialtyFilter,
      ...approvedFilter,
    };
    
    const count = await Artisan.countDocuments(filters);
    
    const artisans = await Artisan.find(filters)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .select('-bankDetails -password -resetPasswordToken -resetPasswordExpire');
    
    // Get product counts for each artisan
    const artisansWithProductCount = await Promise.all(
      artisans.map(async (artisan) => {
        const productCount = await Product.countDocuments({ artisan: artisan._id });
        return {
          ...artisan._doc,
          productCount,
        };
      })
    );
    
    res.json({
      artisans: artisansWithProductCount,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get artisan by ID
// @route   GET /api/artisans/:id
// @access  Public
exports.getArtisanById = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id)
      .select('-bankDetails -password -resetPasswordToken -resetPasswordExpire');

    if (artisan) {
      // Get product count
      const productCount = await Product.countDocuments({ artisan: artisan._id });
      
      res.json({
        ...artisan._doc,
        productCount,
      });
    } else {
      res.status(404).json({ message: 'Artisan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all artisans (admin)
// @route   GET /api/artisans/admin/all
// @access  Private/Admin
exports.getArtisansAdmin = async (req, res) => {
  try {
    const artisans = await Artisan.find({})
      .select('-password -resetPasswordToken -resetPasswordExpire');
    
    res.json(artisans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve artisan
// @route   PUT /api/artisans/:id/approve
// @access  Private/Admin
exports.approveArtisan = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);

    if (artisan) {
      artisan.approved = true;
      await artisan.save();
      
      res.json({ message: 'Artisan approved successfully' });
    } else {
      res.status(404).json({ message: 'Artisan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete artisan
// @route   DELETE /api/artisans/:id
// @access  Private/Admin
exports.deleteArtisan = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);

    if (artisan) {
      await artisan.remove();
      res.json({ message: 'Artisan removed' });
    } else {
      res.status(404).json({ message: 'Artisan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
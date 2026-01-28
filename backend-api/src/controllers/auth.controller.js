const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register
exports.register = async (req, res, next) => {
  try {
    const { email, phone, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists.'
      });
    }

    // Create user
    const user = await User.create({
      email,
      phone,
      password,
      firstName,
      lastName,
      role: role || 'resident',
      otp: generateOTP(),
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // TODO: Send OTP via SMS/Email

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your account with OTP.',
      data: {
        userId: user._id,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({
      phone,
      otp,
      otpExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.'
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Account verified successfully.',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .populate('society', 'name')
      .populate('flat', 'flatNumber block');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Contact admin.'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          society: user.society,
          flat: user.flat,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login with Phone OTP
exports.sendLoginOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number.'
      });
    }

    user.otp = generateOTP();
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // TODO: Send OTP via SMS

    res.json({
      success: true,
      message: 'OTP sent successfully.',
      data: {
        phone: user.phone,
        // Remove in production - for testing only
        otp: process.env.NODE_ENV === 'development' ? user.otp : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify Login OTP
exports.verifyLoginOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({
      phone,
      otp,
      otpExpiry: { $gt: new Date() }
    }).populate('society', 'name')
      .populate('flat', 'flatNumber block');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.'
      });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          society: user.society,
          flat: user.flat
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email.'
      });
    }

    const resetToken = generateOTP();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    // TODO: Send email with reset token

    res.json({
      success: true,
      message: 'Password reset token sent to email.',
      // Remove in production
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. Please login with new password.'
    });
  } catch (error) {
    next(error);
  }
};

const express = require('express');
const passport = require('passport');
const nodemailer = require('nodemailer'); // For Email OTPs
const crypto = require('crypto'); // For generating OTPs
const User = require('../models/User');
const OTP = require('../models/OTP');
const router = express.Router();

// *******

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP Route
router.post('/send-otp', async (req, res) => {
  const { useremail } = req.body;

  try {
    const existingUser = await User.findOne({ useremail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    if (!useremail)
      return res.status(400).json({ message: 'Email is required' });

    const otp = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit OTP

    // Delete any existing OTP for the email
    await OTP.deleteOne({ email: useremail });

    // Save new OTP in MongoDB
    const newOtp = new OTP({ email: useremail, otp });
    await newOtp.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: useremail,
      subject: 'OTP for Registration',
      html: `Dear User,<br><br><b>${otp}</b> is your OTP for Registration on Let's Blog.<br><br>It is valid for 5 minutes.<br><br>Thank you.`,
    });
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// Register Route
router.get('/register', (req, res) => {
  const user = req.user || null;
  res.render('auth/register', { user });
});

router.post('/register', async (req, res) => {
  const { username, useremail, otp, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return res
      .status(400)
      .json({ message: 'Password and Confirm Password must be same.' });
  }

  try {
    const existingUser = await User.findOne({ useremail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    if (!useremail || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find OTP in MongoDB
    const storedOtp = await OTP.findOne({ email: useremail });

    if (!storedOtp) {
      return res
        .status(400)
        .json({ message: 'OTP expired or not found. Request a new one.' });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP is correct, proceed with registration

    const user = new User({ username, useremail, password });
    await user.save();

    await OTP.deleteOne({ email: useremail }); // Delete OTP after successful verification

    res.status(200).json({ message: 'User registered successfully!' });
  } catch (err) {
    res
      .status(500)
      .json({ error: 'An error occurred. Please try again later.' });
  }
});

// Login Route
router.get('/login', (req, res) => {
  const user = req.user || null;
  res.render('auth/login', { user });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'An error occurred', error: err });
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Login failed' });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return res
          .status(500)
          .json({ message: 'Login error', error: loginErr });
      }

      return res
        .status(200)
        .json({ message: info?.message || 'Login successful', user });
    });
  })(req, res, next);
});

// Google OAuth Login
router.get(
  '/auth/google',
  (req, res, next) => {
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth Callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/user/profile');
  }
);

// Logout Route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: 'An error occurred while logging out.' });
    }
    res.redirect('/login');
  });
});

// Forgot Password Page Route
router.get('/forgot-password', (req, res) => {
  const user = req.user || null;
  res.render('auth/forgot-password', { user });
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  const { useremail } = req.body;

  if (!useremail) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ useremail });
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found with this email' });
    }

    // If user has a Google account, prevent password reset
    if (user.googleId) {
      return res.status(400).json({
        message: 'Account created via Google. Log in using Google.',
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit OTP

    // Delete any existing OTP for the email
    await OTP.deleteOne({ email: useremail });

    // Save new OTP in MongoDB
    const newOtp = new OTP({ email: useremail, otp });
    await newOtp.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: useremail,
      subject: 'Reset Your Password - OTP',
      html: `Dear User,<br><br><b>${otp}</b> is your OTP for resetting your password.<br><br>It is valid for 5 minutes.<br><br>Thank you.`,
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { useremail, otp, newPassword, confirmNewPassword } = req.body;

  if (!useremail || !otp || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const storedOtp = await OTP.findOne({ email: useremail });

    if (!storedOtp || storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ useremail });
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found with this email' });
    }

    // If user has a Google account, prevent password reset
    if (user.googleId) {
      return res.status(400).json({
        message: 'Account created via Google. Log in using Google.',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    user.password = hashedPassword;
    await user.save();

    // Delete OTP after successful password reset
    await OTP.deleteOne({ email: useremail });

    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router;

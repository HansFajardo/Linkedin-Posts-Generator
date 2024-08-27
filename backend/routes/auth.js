const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const adminEmails = ["maxim@hipaaspace.com", "admin@email.com"];
const adminPassword = "adminpassword";

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if the email is an admin email first
    const isAdmin = adminEmails.includes(email);

    if (isAdmin && password === adminPassword) {
      // If the credentials match the admin credentials
      const token = jwt.sign({ id: email, isAdmin: true }, '123ihu91879hg23', { expiresIn: '1h' });
      return res.json({ token, isAdmin: true });
    }

    // If the email is not one of the admin emails, proceed with the database check
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, isAdmin: false }, '123ihu91879hg23', { expiresIn: '1h' });
    res.json({ token, isAdmin: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

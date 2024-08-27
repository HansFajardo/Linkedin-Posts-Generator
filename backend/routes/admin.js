const express = require('express');
const User = require('../models/User');  // Ensure the path is correct

const router = express.Router();

// Fetch all user emails
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'email');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a user by ID
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

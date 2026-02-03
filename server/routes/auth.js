const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../models/data');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role
  });
});

module.exports = router;

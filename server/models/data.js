const bcrypt = require('bcryptjs');

// In-memory storage (in production, use a real database)
const users = [
  {
    id: 1,
    username: 'superadmin',
    password: bcrypt.hashSync('superadmin123', 10),
    role: 'super_admin',
    name: 'Super Administrator'
  },
  {
    id: 2,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    name: 'Administrator'
  },
  {
    id: 3,
    username: 'user',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
    name: 'User'
  }
];

const rides = [];
const customers = [];
const finances = [];

module.exports = { users, rides, customers, finances };

const express = require('express');
const { finances } = require('../models/data');
const { authenticateToken, checkRole, checkDeletePermission } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Only super_admin and admin can view finances
router.use(checkRole('super_admin', 'admin'));

// Get all finances
router.get('/', (req, res) => {
  res.json(finances);
});

// Create a finance entry
router.post('/', (req, res) => {
  const { type, amount, description, date, relatedTo } = req.body;
  
  if (!type || !amount || !date) {
    return res.status(400).json({ message: 'Type, amount, and date are required' });
  }

  const finance = {
    id: finances.length + 1,
    type, // 'income' or 'expense'
    amount: parseFloat(amount),
    description: description || '',
    date,
    relatedTo: relatedTo || '',
    createdBy: req.user.username,
    createdAt: new Date().toISOString()
  };

  finances.push(finance);
  res.status(201).json(finance);
});

// Update a finance entry
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const financeIndex = finances.findIndex(f => f.id === id);

  if (financeIndex === -1) {
    return res.status(404).json({ message: 'Finance entry not found' });
  }

  const { type, amount, description, date, relatedTo } = req.body;
  finances[financeIndex] = {
    ...finances[financeIndex],
    type: type || finances[financeIndex].type,
    amount: amount !== undefined ? parseFloat(amount) : finances[financeIndex].amount,
    description: description !== undefined ? description : finances[financeIndex].description,
    date: date || finances[financeIndex].date,
    relatedTo: relatedTo !== undefined ? relatedTo : finances[financeIndex].relatedTo,
    updatedBy: req.user.username,
    updatedAt: new Date().toISOString()
  };

  res.json(finances[financeIndex]);
});

// Delete a finance entry (only super admin)
router.delete('/:id', checkDeletePermission, (req, res) => {
  const id = parseInt(req.params.id);
  const financeIndex = finances.findIndex(f => f.id === id);

  if (financeIndex === -1) {
    return res.status(404).json({ message: 'Finance entry not found' });
  }

  const deletedFinance = finances.splice(financeIndex, 1);
  res.json({ message: 'Finance entry deleted', finance: deletedFinance[0] });
});

module.exports = router;

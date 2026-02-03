const express = require('express');
const { customers } = require('../models/data');
const { authenticateToken, checkDeletePermission } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all customers
router.get('/', (req, res) => {
  res.json(customers);
});

// Create a customer
router.post('/', (req, res) => {
  const { name, email, phone, address } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  const customer = {
    id: customers.length + 1,
    name,
    email,
    phone: phone || '',
    address: address || '',
    createdBy: req.user.username,
    createdAt: new Date().toISOString()
  };

  customers.push(customer);
  res.status(201).json(customer);
});

// Update a customer
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const customerIndex = customers.findIndex(c => c.id === id);

  if (customerIndex === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const { name, email, phone, address } = req.body;
  customers[customerIndex] = {
    ...customers[customerIndex],
    name: name || customers[customerIndex].name,
    email: email || customers[customerIndex].email,
    phone: phone !== undefined ? phone : customers[customerIndex].phone,
    address: address !== undefined ? address : customers[customerIndex].address,
    updatedBy: req.user.username,
    updatedAt: new Date().toISOString()
  };

  res.json(customers[customerIndex]);
});

// Delete a customer (only super admin)
router.delete('/:id', checkDeletePermission, (req, res) => {
  const id = parseInt(req.params.id);
  const customerIndex = customers.findIndex(c => c.id === id);

  if (customerIndex === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const deletedCustomer = customers.splice(customerIndex, 1);
  res.json({ message: 'Customer deleted', customer: deletedCustomer[0] });
});

module.exports = router;

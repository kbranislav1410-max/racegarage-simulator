const express = require('express');
const { rides } = require('../models/data');
const { authenticateToken, checkDeletePermission } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all rides
router.get('/', (req, res) => {
  res.json(rides);
});

// Create a ride
router.post('/', (req, res) => {
  const { customerName, vehicleName, date, description } = req.body;
  
  if (!customerName || !vehicleName || !date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const ride = {
    id: rides.length + 1,
    customerName,
    vehicleName,
    date,
    description: description || '',
    createdBy: req.user.username,
    createdAt: new Date().toISOString()
  };

  rides.push(ride);
  res.status(201).json(ride);
});

// Update a ride
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const rideIndex = rides.findIndex(r => r.id === id);

  if (rideIndex === -1) {
    return res.status(404).json({ message: 'Ride not found' });
  }

  const { customerName, vehicleName, date, description } = req.body;
  rides[rideIndex] = {
    ...rides[rideIndex],
    customerName: customerName || rides[rideIndex].customerName,
    vehicleName: vehicleName || rides[rideIndex].vehicleName,
    date: date || rides[rideIndex].date,
    description: description !== undefined ? description : rides[rideIndex].description,
    updatedBy: req.user.username,
    updatedAt: new Date().toISOString()
  };

  res.json(rides[rideIndex]);
});

// Delete a ride (only super admin)
router.delete('/:id', checkDeletePermission, (req, res) => {
  const id = parseInt(req.params.id);
  const rideIndex = rides.findIndex(r => r.id === id);

  if (rideIndex === -1) {
    return res.status(404).json({ message: 'Ride not found' });
  }

  const deletedRide = rides.splice(rideIndex, 1);
  res.json({ message: 'Ride deleted', ride: deletedRide[0] });
});

module.exports = router;

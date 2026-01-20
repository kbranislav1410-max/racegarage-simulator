const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Overview page - showing last activities for rides and riders
app.get('/', (req, res) => {
  // Get last 10 rides with their amounts (payment amounts)
  const lastRidesQuery = `
    SELECT 
      rides.id,
      rides.date,
      rides.track,
      rides.duration,
      rides.notes,
      riders.name as rider_name,
      payments.amount,
      rides.created_at
    FROM rides
    LEFT JOIN riders ON rides.rider_id = riders.id
    LEFT JOIN payments ON rides.id = payments.ride_id
    ORDER BY rides.created_at DESC
    LIMIT 10
  `;

  // Get last 10 riders activity
  const lastRidersQuery = `
    SELECT 
      id,
      name,
      email,
      phone,
      created_at,
      updated_at
    FROM riders
    ORDER BY updated_at DESC
    LIMIT 10
  `;

  db.all(lastRidesQuery, [], (err, rides) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }

    db.all(lastRidersQuery, [], (err, riders) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database error');
      }

      res.render('index', { rides, riders });
    });
  });
});

// Riders CRUD
app.get('/riders', (req, res) => {
  db.all('SELECT * FROM riders ORDER BY created_at DESC', [], (err, riders) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.render('riders', { riders });
  });
});

app.post('/riders', (req, res) => {
  const { name, email, phone } = req.body;
  db.run(
    'INSERT INTO riders (name, email, phone) VALUES (?, ?, ?)',
    [name, email, phone],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Database error');
      }
      res.redirect('/riders');
    }
  );
});

app.post('/riders/:id/delete', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM riders WHERE id = ?', [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.redirect('/riders');
  });
});

// Rides CRUD
app.get('/rides', (req, res) => {
  db.all(
    `SELECT 
      rides.*,
      riders.name as rider_name,
      payments.amount,
      payments.payment_method
    FROM rides
    LEFT JOIN riders ON rides.rider_id = riders.id
    LEFT JOIN payments ON rides.id = payments.ride_id
    ORDER BY rides.created_at DESC`,
    [],
    (err, rides) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database error');
      }

      db.all('SELECT * FROM riders', [], (err, riders) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Database error');
        }
        res.render('rides', { rides, riders });
      });
    }
  );
});

app.post('/rides', (req, res) => {
  const { rider_id, date, track, duration, notes, amount, payment_method } = req.body;
  
  db.run(
    'INSERT INTO rides (rider_id, date, track, duration, notes) VALUES (?, ?, ?, ?, ?)',
    [rider_id, date, track, duration, notes],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Database error');
      }
      
      const rideId = this.lastID;
      
      // If amount is provided, create payment
      if (amount) {
        db.run(
          'INSERT INTO payments (ride_id, amount, payment_method) VALUES (?, ?, ?)',
          [rideId, amount, payment_method || 'cash'],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Database error');
            }
            res.redirect('/rides');
          }
        );
      } else {
        res.redirect('/rides');
      }
    }
  );
});

app.post('/rides/:id/delete', (req, res) => {
  const { id } = req.params;
  // This will cascade delete the associated payment due to the trigger
  db.run('DELETE FROM rides WHERE id = ?', [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.redirect('/rides');
  });
});

// Payments CRUD
app.get('/payments', (req, res) => {
  db.all(
    `SELECT 
      payments.*,
      rides.date as ride_date,
      rides.track,
      riders.name as rider_name
    FROM payments
    LEFT JOIN rides ON payments.ride_id = rides.id
    LEFT JOIN riders ON rides.rider_id = riders.id
    ORDER BY payments.created_at DESC`,
    [],
    (err, payments) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database error');
      }
      res.render('payments', { payments });
    }
  );
});

app.post('/payments/:id/delete', (req, res) => {
  const { id } = req.params;
  
  // First get the ride_id associated with this payment
  db.get('SELECT ride_id FROM payments WHERE id = ?', [id], (err, payment) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    
    if (!payment) {
      return res.status(404).send('Payment not found');
    }
    
    // Delete the ride, which will cascade delete the payment via foreign key constraint
    db.run('DELETE FROM rides WHERE id = ?', [payment.ride_id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database error');
      }
      res.redirect('/payments');
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

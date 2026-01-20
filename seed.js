const db = require('./database');

// Seed data for testing
db.serialize(() => {
  console.log('Seeding database...');

  // Insert sample riders
  const riders = [
    { name: 'Martin Novák', email: 'martin@example.com', phone: '+421901234567' },
    { name: 'Peter Kovács', email: 'peter@example.com', phone: '+421902345678' },
    { name: 'Jana Horváthová', email: 'jana@example.com', phone: '+421903456789' }
  ];

  riders.forEach(rider => {
    db.run(
      'INSERT INTO riders (name, email, phone) VALUES (?, ?, ?)',
      [rider.name, rider.email, rider.phone],
      function(err) {
        if (err) {
          console.error('Error inserting rider:', err);
        } else {
          console.log(`Inserted rider: ${rider.name} (ID: ${this.lastID})`);
        }
      }
    );
  });

  // Wait for riders to be inserted before inserting rides
  setTimeout(() => {
    const rides = [
      { rider_id: 1, date: '2026-01-15T10:00:00', track: 'Slovakia Ring', duration: 45, notes: 'Prvá jazda sezóny' },
      { rider_id: 2, date: '2026-01-16T14:00:00', track: 'Hungaroring', duration: 60, notes: 'Tréning pre preteky' },
      { rider_id: 1, date: '2026-01-17T09:00:00', track: 'Slovakia Ring', duration: 30, notes: 'Rýchla ranná jazda' },
      { rider_id: 3, date: '2026-01-18T11:00:00', track: 'Red Bull Ring', duration: 50, notes: 'Test nových pneumatík' }
    ];

    rides.forEach((ride, index) => {
      db.run(
        'INSERT INTO rides (rider_id, date, track, duration, notes) VALUES (?, ?, ?, ?, ?)',
        [ride.rider_id, ride.date, ride.track, ride.duration, ride.notes],
        function(err) {
          if (err) {
            console.error('Error inserting ride:', err);
          } else {
            const rideId = this.lastID;
            console.log(`Inserted ride: ${ride.track} (ID: ${rideId})`);

            // Add payment for each ride
            const amount = 50 + (index * 20);
            db.run(
              'INSERT INTO payments (ride_id, amount, payment_method) VALUES (?, ?, ?)',
              [rideId, amount, index % 2 === 0 ? 'cash' : 'card'],
              function(err) {
                if (err) {
                  console.error('Error inserting payment:', err);
                } else {
                  console.log(`Inserted payment: ${amount}€ for ride ${rideId}`);
                }
              }
            );
          }
        }
      );
    });
  }, 500);
});

setTimeout(() => {
  console.log('Database seeded successfully!');
  db.close();
}, 2000);

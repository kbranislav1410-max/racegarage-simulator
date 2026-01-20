const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'racegarage.db');
const db = new sqlite3.Database(dbPath);

// Enable foreign key constraints (disabled by default in SQLite)
db.run('PRAGMA foreign_keys = ON');

// Initialize database schema
db.serialize(() => {
  // Create Riders table
  db.run(`
    CREATE TABLE IF NOT EXISTS riders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Rides table
  db.run(`
    CREATE TABLE IF NOT EXISTS rides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rider_id INTEGER NOT NULL,
      date DATETIME NOT NULL,
      track TEXT NOT NULL,
      duration INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE CASCADE
    )
  `);

  // Create Payments table with cascade delete dependency on Rides
  // When a ride is deleted, its payment is automatically deleted via ON DELETE CASCADE
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ride_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;

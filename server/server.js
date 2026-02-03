const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ridesRoutes = require('./routes/rides');
const customersRoutes = require('./routes/customers');
const financesRoutes = require('./routes/finances');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/finances', financesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

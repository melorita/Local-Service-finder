const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'temporary_default_secret_key_123';
    console.warn('Warning: JWT_SECRET not found in .env, using temporary default.');
}


const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/providers');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.send('Local Service Finder API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

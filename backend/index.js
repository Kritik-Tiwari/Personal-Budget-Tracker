const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
require('./Models/db');

const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
const ExpenseRouter = require('./Routes/ExpenseRouter');
const ensureAuthenticated = require('./Middlewares/Auth');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get('/ping', (req, res) => res.send('PONG'));
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);
app.use('/expenses', ensureAuthenticated, ExpenseRouter); // all expense routes protected

// Start
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

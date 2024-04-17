// middleswares/errorHandlers.js
const express = require('express');
const errorHandlers = require('./middlewares/errorHandlers');

const app = express();

if (!user) {
    return done(null, false, { message: 'Incorrect email.' });
}

const isPasswordValid = await bcrypt.compare(password, user.password);

if (!isPasswordValid) {
    return done(null, false, { message: 'Incorrect password. Please try again.' });
}

return done(null, user);

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
}

module.exports = errorHandler;

// Define your routes
app.use('/api', require('./routes/auth'));

// Use the error handling middleware
app.use(errorHandlers); // Applying the error handling middleware
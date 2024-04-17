//routes/stockIndexData.js
const express = require('express');
const router = express.Router();
const wineStockIndexController = require('../controllers/wineStockIndexController');

router.get('/dashboard', wineStockIndexController.fetchWineStockIndexData);

module.exports = router;
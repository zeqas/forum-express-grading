const express = require('express')
const router = require('./routes')

const adminController = require('../controllers/api/adminController.js')

router.get('/admin/restaurants', adminController.getRestaurants)

module.exports = router
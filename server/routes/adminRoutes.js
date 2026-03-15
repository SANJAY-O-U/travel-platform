const express = require('express');
const router = express.Router();
const { getDashboard, getAllUsers, updateUserStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/users', protect, adminOnly, getAllUsers);
router.patch('/users/:id', protect, adminOnly, updateUserStatus);
module.exports = router;
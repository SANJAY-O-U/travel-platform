const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.post('/wishlist/:hotelId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const exists = user.wishlist.includes(req.params.hotelId);

    if (exists) {
      user.wishlist.pull(req.params.hotelId);
    } else {
      user.wishlist.push(req.params.hotelId);
    }

    await user.save();

    res.json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
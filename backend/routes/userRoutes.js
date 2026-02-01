const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// potentially add admin middleware here
const auth = require('../middleware/authMiddleware');

// Assuming auth middleware puts user in req.user
// We might want a middleware to check if role is admin

router.get('/', auth, userController.getAllUsers);
router.get('/online', auth, userController.getOnlineUsers);
router.post('/', auth, userController.createUser); // Admin creating users
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;

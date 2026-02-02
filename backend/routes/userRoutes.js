const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, userController.getAllUsers);
router.get('/online', auth, userController.getOnlineUsers);
router.get('/stats', auth, userController.getOnlineStats);
router.post('/change-password', auth, userController.changePassword);
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;

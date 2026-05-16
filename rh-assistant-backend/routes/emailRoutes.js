const express = require('express');
const router = express.Router();
const { getEmails, updateEmail, sendReply } = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getEmails);

router.post('/reply', sendReply);

router.route('/:id')
  .put(updateEmail);

module.exports = router;

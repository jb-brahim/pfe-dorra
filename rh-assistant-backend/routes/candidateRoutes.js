const express = require('express');
const router = express.Router();
const { getCandidates, getCandidate, updateCandidateStatus, createCandidate, uploadCvAndEvaluate } = require('../controllers/candidateController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

router.route('/')
  .get(getCandidates)
  .post(createCandidate);

router.post('/upload-cv', upload.single('cv'), uploadCvAndEvaluate);

router.route('/:id')
  .get(getCandidate)
  .put(updateCandidateStatus);

router.put('/:id/status', updateCandidateStatus);

module.exports = router;

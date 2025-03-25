const {
    getAllReviewsByBook,
    getAllReviewsByUser,
    registerUser,
    loginUser,
    logoutUser,
    postReview,
    updateReview, 
    deleteReview
} = require('../controllers/reviewControllers.js');
const express = require('express');
const router = express.Router();

router.get('/reviews/book', getAllReviewsByBook);
router.get('/reviews/user', getAllReviewsByUser);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/reviews', postReview);
router.put('/reviews', updateReview);
router.delete('/reviews', deleteReview);

module.exports = router;
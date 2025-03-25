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

router.post('/reviews/book', getAllReviewsByBook);
router.post('/reviews/user', getAllReviewsByUser);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/review', postReview);
router.put('/review', updateReview);
router.delete('/review', deleteReview);

module.exports = router;
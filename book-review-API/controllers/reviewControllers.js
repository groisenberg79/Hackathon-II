const {
    allReviewsQuery,
    UserReviewsQuery,
    registerUserQuery,
    userLoginQuery,
    createReviewQuery,
    createBookQuery,
    updateReviewQuery,
    deleteReviewQuery,
    findBookQuery,
    getReviewByIdQuery
} = require('../models/userQueries.js');
const axios = require('axios');

const getCleanBookDataFromOpenLibrary = async (title, author) => {
    const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;
    const searchResponse = await axios.get(searchUrl);

    const bookDocs = searchResponse.data.docs;
    if (!bookDocs || bookDocs.length === 0) {
        throw new Error("No books found in Open Library search.");
    }

    const workKey = bookDocs[0].key; // e.g. "/works/OL27448W"
    const openLibraryId = workKey.replace('/works/', '');

    const workUrl = `https://openlibrary.org/works/${openLibraryId}.json`;
    const workResponse = await axios.get(workUrl);
    const workData = workResponse.data;

    const bookTitle = workData.title || title;
    const bookAuthor = bookDocs[0].author_name ? bookDocs[0].author_name[0] : author;
    const bookCover = bookDocs[0].cover_i
        ? `https://covers.openlibrary.org/b/id/${bookDocs[0].cover_i}-M.jpg`
        : null;

    return {
        openLibraryId,
        bookTitle,
        bookAuthor,
        bookCover
    };
};

const checkReviewOwnership = async (review_id, userId) => {
    const review = await getReviewByIdQuery(review_id);
    if (!review) {
        throw new Error('Review not found.');
    }
    const reviewOwnerId = review.user_id;
    if (reviewOwnerId !== userId) {
        throw new Error('Forbidden: You do not own this review.');
    }
};

const getAllReviewsByBook = async (req, res) => {
    const title = req.body.title;
    const author = req.body.author;
    try {
        const reviews = await allReviewsQuery(title, author);
        if (reviews.length > 0) {
            res.status(200).json(reviews);
        } else {
            res.status(404).json({message: 'Author and/or book not found.'})
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const getAllReviewsByUser = async (req, res) => {
    const username = req.body.username;
    try {
        const reviews = await UserReviewsQuery(username);
        if (reviews.length > 0) {
            res.status(200).json(reviews);
        } else {
            res.status(404).json({message: 'No reviews from this user yet.'})
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const registerUser = async (req, res) => {
    const { email, username } = req.body;
    try {
        const result = await registerUserQuery(email, username);
        if (result.length > 0) {
            res.status(200).json({message: 'User successfully registered'});
        } else {
            res.status(400).json({message: 'Cannot register empty email'});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const loginUser = async (req, res) => {
    const { email } = req.body;
    console.log("Login attempt:", email); 
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const result = await userLoginQuery(email);
        if (result.length > 0) {
            const user = result[0];
            req.session.user = { id: user.id, username: user.username }; 
            res.status(200).json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ message: 'Invalid email' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const postReview = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { title, author, rating, content } = req.body;

    try {
        const existingBook = await findBookQuery(null, title, author);
        let bookId;

        if (existingBook && existingBook.length > 0) {
            // If the book exists, use its book ID
            bookId = existingBook[0].id;
        } else {
            const {
                openLibraryId,
                bookTitle,
                bookAuthor,
                bookCover
            } = await getCleanBookDataFromOpenLibrary(title, author);
            
            const existingBookFromApi = await findBookQuery(openLibraryId, bookTitle, bookAuthor);
            if (existingBookFromApi && existingBookFromApi.length > 0) {
                // If the book exists, use the existing book ID
                bookId = existingBookFromApi[0].id;
            } else {
                const newBook = await createBookQuery(openLibraryId, bookTitle, bookAuthor, bookCover);
                console.log("Created new book:", newBook);
                bookId = newBook.id;
            }
        }
        console.log("bookId being passed to createReviewQuery:", bookId);
        const result = await createReviewQuery(req.session.user.id, bookId, rating, content);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateReview = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { review_id, new_rating, new_review } = req.body;

    if (!review_id || !new_rating || !new_review) {
        return res.status(400).json({ message: 'Review ID, new rating, and new review content are required.' });
    }

    try {
        await checkReviewOwnership(review_id, req.session.user.id);
        const result = await updateReviewQuery(review_id, new_rating, new_review);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.message === 'Review not found.' ? 404 : 403).json({ message: error.message });
    }
}

const deleteReview = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { review_id } = req.body;
    try {
        await checkReviewOwnership(review_id, req.session.user.id);
        const result = await deleteReviewQuery(review_id);
        res.status(200).json({ message: 'Review deleted successfully.' });
    } catch (error) {
        res.status(error.message === 'Review not found.' ? 404 : 403).json({ message: error.message });
    }
}

const logoutUser = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'No user is logged in.' });
    }

    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout successful.' });
    });
};

module.exports = {
    getAllReviewsByBook,
    getAllReviewsByUser,
    registerUser,
    loginUser,
    postReview,
    updateReview,
    deleteReview,
    logoutUser
}
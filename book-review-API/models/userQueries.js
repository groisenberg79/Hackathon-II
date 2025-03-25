const  { database } = require('../configs/database.js');

const allReviewsQuery = (title, author) => {
    return database('books')
      .join('reviews', 'books.id', 'reviews.book_id')
      .select('reviews.*')  // select columns from the reviews table; adjust if you need book info as well
      .where({
        'books.title': title,
        'books.author': author
      });
}; 

// get all reviews from a single user
const UserReviewsQuery = (username) => {
    return database('reviews')
        .join('users', 'reviews.user_id', '=', 'users.id')
        .select('reviews.*')
        .where('users.username', username);
}

const registerUserQuery = (userEmail, username) => {
    if (userEmail.length > 0 && username.length > 0){
        return database('users')
            .insert({ email: userEmail, username: username }, ['id', 'email', 'username', 'created_at']);
    } else {
        return null;
    }
}

const userLoginQuery = (userEmail) => {
    return database('users')
        .select('users.*')
        .where({'email': userEmail});
}

const createReviewQuery = (userId, bookId, rating, reviewText) => {
    return database('reviews')
        .insert({
            user_id: userId,
            book_id: bookId,
            rating: rating,
            review_text: reviewText
        }, ['user_id', 'book_id', 'rating', 'review_text']);
}

const createBookQuery = async (openLibraryId, title, author, coverUrl) => {
    const existingBook = await database('books')
        .select('*')
        .where({ open_library_id: openLibraryId })
        .first();

    if (existingBook) {
        return existingBook;
    } else {
        const result = await database('books')
            .insert({
                open_library_id: openLibraryId, 
                title: title, 
                author: author, 
                cover_url: coverUrl
            })
            .returning('*');

        return result[0];
    }
}

const updateReviewQuery = (reviewId, newRating, newReview) => {
    return database('reviews')
        .where('id', reviewId)
        .update({
            rating: newRating,
            review_text: newReview,
            updated_at: database.fn.now()
        }, ['id', 'rating', 'review_text', 'updated_at']);
}

const deleteReviewQuery = (reviewId) => {
    return database('reviews')
        .where('id', reviewId)
        .del(['id', 'book_id', 'rating', 'review_text', 'created_at', 'updated_at']);
}

const findBookQuery = (openLibraryId, title, author) => {
    console.log("Searching for book with openLibraryId:", openLibraryId);  // Check the value

    const query = database('books').select('*');

    if (openLibraryId) {
        return query.where({ open_library_id: openLibraryId }).first();
    }

    return query.where({ title, author }).first();
};

const getReviewByIdQuery = (reviewId) => {
    return database('reviews')
        .select('*')
        .where({ id: reviewId })
        .first();
};

module.exports = {
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
}
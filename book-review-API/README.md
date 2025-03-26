# Book Review App

A full-stack web application that allows users to search for books via the Open Library API, post reviews, and manage their own review content.

## Features

- User login with session handling
- Post, view, edit, and delete book reviews
- Search reviews by book or username
- Fully styled and responsive frontend
- Backend built with Node.js, Express, PostgreSQL

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JavaScript (Vanilla)
- HTML & CSS
- Open Library API

## Setup Instructions

### 📦 Prerequisites

- [Node.js](https://nodejs.org/) installed
- [PostgreSQL](https://www.postgresql.org/) installed
- A database set up with the required tables and data (see `/models/queries.sql` or migration script if applicable)

### 🚀 Running the Project

1. Clone the repository:

```bash
git clone https://github.com/groisenberg79/Hackathon-II.git
cd Hackathon-II/book-review-API
```

2. Install dependencies:

```bash
npm install
```

3. Start the PostgreSQL server if not already running.

4. Create a `.env` file (if using environment variables):

```env
PORT=3000
DATABASE_URL=postgres://your-user:your-password@localhost:5432/your-db-name
SESSION_SECRET=yourSecret
```

5. Start the server:

```bash
node server.js
```

6. Visit the app:

```
http://localhost:3000
```

> **Note:** Make sure the backend is running before interacting with the frontend.

---

## API Routes (Backend)

### 🟢 POST `/login`
 - Logs a user in by email (no password required for demo).
 - Body: `{ "email": "user@example.com" }`

### 🟢 POST `/logout`
 - Logs the user out by clearing the session.
 - No body required.

### 🟢 POST `/review`
- Submit a new review.
- Body: `{ "title": "...", "author": "...", "rating": 4, "content": "..." }`

### 🟢 POST `/reviews/book`
- Fetch all reviews for a specific book.
- Body: `{ "title": "...", "author": "..." }`

### 🟢 POST `/reviews/user`
- Fetch all reviews written by a user.
- Body: `{ "username": "..." }`

### 🟡 PUT `/review`
- Update a review by ID.
- Body: `{ "review_id": 1, "new_rating": 5, "new_review": "Updated!" }`

### 🔴 DELETE `/review`
- Delete a review by ID.
- Body: `{ "review_id": 1 }`

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Author

Gabriel Roisenberg Rodrigues  
https://github.com/groisenberg79


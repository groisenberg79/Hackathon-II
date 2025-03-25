document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM fully loaded");
  const userReviewSearchForm = document.getElementById("user-review-search-form");
  if (userReviewSearchForm) {
    userReviewSearchForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("userReviewSearchForm submit handler running");
      const username = document.getElementById("search-username").value;
      await fetchUserReviews(username);
    });
  }

  const bookReviewSearchForm = document.getElementById("book-review-search-form");
  if (bookReviewSearchForm) {
    bookReviewSearchForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("Book review search form submitted");

      const title = document.getElementById("search-title").value;
      const author = document.getElementById("search-author").value;

      try {
        const res = await fetch("/reviews/book", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ title, author })
        });

        const data = await res.json();
        const container = document.getElementById("book-reviews-results");
        container.innerHTML = "";

        if (res.ok && data.length > 0) {
          data.forEach(review => {
            const div = document.createElement("div");
            div.innerHTML = `
              <hr>
              <p><strong>Rating:</strong> ${review.rating}</p>
              <p><strong>Review:</strong> ${review.review_text}</p>
              <p><em>Posted on:</em> ${new Date(review.created_at).toLocaleString()}</p>
            `;
            container.appendChild(div);
          });
        } else {
          container.textContent = "No reviews found for this book.";
        }
      } catch (error) {
        document.getElementById("book-reviews-results").textContent = "Error fetching reviews.";
      }
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("Login form submitted");

      const email = document.getElementById("email").value;

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        });

        const data = await res.json();
        const message = res.ok ? "Login successful!" : data.message || "Login failed.";
        displayLoginMessage(message, !res.ok);
      } catch (error) {
        displayLoginMessage("Error logging in.", true);
      }
    });
  }

  const reviewForm = document.getElementById("review-form");
  if (reviewForm) {
    reviewForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("Review form submitted");

      const title = document.getElementById("title").value;
      const author = document.getElementById("author").value;
      const rating = parseInt(document.getElementById("rating").value);
      const content = document.getElementById("content").value;

      try {
        const res = await fetch("/review", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ title, author, rating, content })
        });

        const data = await res.json();
        const message = res.ok ? "Review submitted successfully!" : data.message || "Failed to submit review.";
        showReviewSubmitMessage(message, !res.ok);
      } catch (error) {
        showReviewSubmitMessage("Error submitting review.", true);
      }
    });
  }
});

async function fetchUserReviews(username) {
  console.log("Fetching reviews for username:", username);
  const container = document.getElementById("user-reviews-results");
  container.innerHTML = "";

  try {
    const res = await fetch("/reviews/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();

    if (res.ok && data.length > 0) {
      showUserReviewMessage(`Found ${data.length} review(s) for "${username}".`);
      renderUserReviews(data, container);
    } else {
      showUserReviewMessage("No reviews found for this user.");
    }
  } catch (error) {
    showUserReviewMessage("Error fetching user reviews.", true);
  }
}

function showUserReviewMessage(message, isError = false) {
  console.log("Displaying message:", message);
  const container = document.getElementById("user-reviews-results");
  container.innerHTML = `
    <p style="color: ${isError ? 'red' : 'green'}; font-weight: bold;">${message}</p>
  `;
}

function renderUserReviews(reviews, container) {
  reviews.forEach(review => {
    const div = document.createElement("div");
    div.innerHTML = `
      <hr>
      <div data-id="${review.id}">
        <p><strong>Book ID:</strong> ${review.book_id}</p>
        <p><strong>Rating:</strong> <span class="rating">${review.rating}</span></p>
        <p><strong>Review:</strong> <span class="review-text">${review.review_text}</span></p>
        <p><em>Posted on:</em> ${new Date(review.created_at).toLocaleString()}</p>
        <button class="edit-review-btn">Edit</button>
        <button class="delete-review-btn" data-id="${review.id}">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".edit-review-btn").forEach(button => {
    button.addEventListener("click", handleEditReview);
  });

  container.querySelectorAll(".delete-review-btn").forEach(button => {
    button.addEventListener("click", async function () {
      const reviewId = this.getAttribute("data-id");

      try {
        const res = await fetch("/review", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ review_id: reviewId })
        });

        const result = await res.json();
        if (res.ok) {
          this.parentElement.remove(); // Remove the review block from the DOM
        } else {
          alert(result.message || "Failed to delete review.");
        }
      } catch (err) {
        alert("Error deleting review.");
      }
    });
  });

  container.addEventListener("click", handleSaveReview);
}

function handleEditReview() {
  const reviewBlock = this.parentElement;
  const reviewId = reviewBlock.getAttribute("data-id");
  const currentRating = reviewBlock.querySelector(".rating").textContent;
  const currentText = reviewBlock.querySelector(".review-text").textContent;

  reviewBlock.innerHTML = `
    <p><strong>Book ID:</strong> ${reviewBlock.querySelector("p strong").parentElement.textContent.split(":")[1].trim()}</p>
    <label>Rating: <input type="number" class="edit-rating" value="${currentRating}" min="1" max="5"></label><br>
    <label>Review: <textarea class="edit-text">${currentText}</textarea></label><br>
    <button class="save-review-btn" data-id="${reviewId}">Save</button>
  `;
}

async function handleSaveReview(e) {
  if (!e.target.classList.contains("save-review-btn")) return;

  const reviewId = e.target.getAttribute("data-id");
  const block = e.target.parentElement;
  const newRating = block.querySelector(".edit-rating").value;
  const newReview = block.querySelector(".edit-text").value;

  try {
    const res = await fetch("/review", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        review_id: reviewId,
        new_rating: newRating,
        new_review: newReview,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      block.innerHTML = `
        <p><strong>Book ID:</strong> ${block.querySelector("p").textContent.split(":")[1].trim()}</p>
        <p><strong>Rating:</strong> <span class="rating">${newRating}</span></p>
        <p><strong>Review:</strong> <span class="review-text">${newReview}</span></p>
        <p><em>Updated just now</em></p>
        <button class="edit-review-btn">Edit</button>
        <button class="delete-review-btn">Delete</button>
      `;
      block.querySelector(".edit-review-btn").addEventListener("click", handleEditReview);
    } else {
      alert(result.message || "Failed to update review.");
    }
  } catch (error) {
    alert("Error updating review.");
  }
}

function displayLoginMessage(message, isError = false) {
  let el = document.getElementById("login-message");
  if (!el) {
    el = document.createElement("div");
    el.id = "login-message";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.color = isError ? "red" : "green";
  el.style.fontWeight = "bold";
}

function showReviewSubmitMessage(message, isError = false) {
  let el = document.getElementById("review-message");
  if (!el) {
    el = document.createElement("div");
    el.id = "review-message";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.color = isError ? "red" : "green";
  el.style.fontWeight = "bold";
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("🚀 DOM fully loaded");

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;

      try {
        const res = await fetch("/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, email })
        });

        const data = await res.json();
        const message = res.ok ? "Registration successful!" : data.message || "Registration failed.";
        showRegisterMessage(message, !res.ok);
      } catch (error) {
        showRegisterMessage("Error registering user.", true);
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

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/logout", {
          method: "POST"
        });

        if (res.ok) {
          alert("Logged out successfully.");
          window.location.href = "index.html";
        } else {
          alert("Logout failed.");
        }
      } catch (err) {
        alert("Error during logout.");
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

  const userReviewSearchForm = document.getElementById("user-review-search-form");
  if (userReviewSearchForm) {
    userReviewSearchForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("userReviewSearchForm submit handler running");

      const username = document.getElementById("search-username").value;
      await fetchUserReviews(username);
    });
  }
}); // End of DOMContentLoaded

function showRegisterMessage(message, isError = false) {
  let el = document.getElementById("register-message");
  if (!el) {
    el = document.createElement("div");
    el.id = "register-message";
    document.body.appendChild(el);
  }
  el.className = isError ? "error" : "success";
  el.textContent = message;
}

function displayLoginMessage(message, isError = false) {
  let el = document.getElementById("login-message");
  if (!el) {
    el = document.createElement("div");
    el.id = "login-message";
    document.body.appendChild(el);
  }
  el.className = isError ? "error" : "success";
  el.textContent = message;
}

function showReviewSubmitMessage(message, isError = false) {
  let el = document.getElementById("review-message");
  if (!el) {
    el = document.createElement("div");
    el.id = "review-message";
    document.body.appendChild(el);
  }
  el.className = isError ? "error" : "success";
  el.textContent = message;
}

async function fetchUserReviews(username) {
  console.log("Fetching reviews for username:", username);
  const container = document.getElementById("user-reviews-results");
  container.innerHTML = "";

  try {
    const res = await fetch("/reviews/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username })
    });

    const data = await res.json();

    if (res.ok && data.length > 0) {
      data.forEach(review => {
        const block = document.createElement("div");
        block.classList.add("review-block");
        block.innerHTML = `
          <p><strong>Book:</strong> ${review.book_title} by ${review.book_author}</p>
          <p><strong>Rating:</strong> <span class="rating">${review.rating}</span></p>
          <p><strong>Review:</strong> <span class="review-text">${review.review_text}</span></p>
          <p><em>Posted on:</em> ${new Date(review.created_at).toLocaleString()}</p>
          <button class="edit-review-btn" data-id="${review.id}">Edit</button>
          <button class="delete-review-btn" data-id="${review.id}">Delete</button>
        `;
        container.appendChild(block);

        block.querySelector(".edit-review-btn").addEventListener("click", handleEditReview);
        block.querySelector(".delete-review-btn").addEventListener("click", handleDeleteReview);
      });
    } else {
      container.textContent = "No reviews found for this user.";
    }
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    container.textContent = "Error fetching user reviews.";
  }
}

function handleEditReview(e) {
  const block = e.target.closest(".review-block");
  const reviewId = e.target.getAttribute("data-id");
  const currentRating = block.querySelector(".rating").textContent;
  const currentReview = block.querySelector(".review-text").textContent;
  const bookInfo = block.querySelector("p")?.textContent || "";
  
  block.innerHTML = `
    <label>Rating:
      <input type="number" min="1" max="5" value="${currentRating}" class="edit-rating" />
    </label>
    <label>Review:
      <textarea class="edit-review">${currentReview}</textarea>
    </label>
    <button class="save-review-btn" data-id="${reviewId}">Save</button>
  `;

  block.querySelector(".save-review-btn").addEventListener("click", async () => {
    const newRating = block.querySelector(".edit-rating").value;
    const newReview = block.querySelector(".edit-review").value;

    try {
      const res = await fetch("/review", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          review_id: reviewId,
          rating: newRating,
          review_text: newReview
        })
      });

      const result = await res.json();
      console.log("Update response:", result);

      if (res.ok) {
        block.innerHTML = `
          <p><strong>Book:</strong> ${bookInfo.split(":")[1].trim()}</p>
          <p><strong>Rating:</strong> <span class="rating">${newRating}</span></p>
          <p><strong>Review:</strong> <span class="review-text">${newReview}</span></p>
          <p><em>Updated just now</em></p>
          <button class="edit-review-btn" data-id="${reviewId}">Edit</button>
          <button class="delete-review-btn" data-id="${reviewId}">Delete</button>
        `;
        block.querySelector(".edit-review-btn").addEventListener("click", handleEditReview);
        block.querySelector(".delete-review-btn").addEventListener("click", handleDeleteReview);
      } else {
        alert(result.message || "User not authorized to update this review.");
      }
    } catch (err) {
      console.error("Update review failed:", err);
      alert("Error updating review.");
    }
  });
}

function handleDeleteReview(e) {
  const reviewId = e.target.getAttribute("data-id");

  fetch("/review", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ review_id: reviewId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.id) {
        e.target.closest(".review-block").remove();
      } else {
        alert(data.message || "User not authorized to delete this review.");
      }
    })
    .catch(() => alert("Error deleting review."));
}

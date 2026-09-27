const reviewsContainer = document.getElementById("reviews");
const statsContainer = document.getElementById("stats");
const form = document.getElementById("reviewForm");
const filter = document.getElementById("filter");
const message = document.getElementById("message");
const health = document.getElementById("health");

const statuses = [
  "Open",
  "In Review",
  "Changes Requested",
  "Approved",
  "Merged"
];

async function loadReviews() {
  const query = filter.value
    ? `?status=${encodeURIComponent(filter.value)}`
    : "";

  const response = await fetch(`/api/reviews${query}`);
  const reviews = await response.json();

  renderReviews(reviews);
  updateStats();
}

function renderReviews(reviews) {
  if (reviews.length === 0) {
    reviewsContainer.innerHTML = "<p>No reviews found.</p>";
    return;
  }

  reviewsContainer.innerHTML = reviews.map((review) => `
    <article class="review-card">
      <div class="review-main">
        <div class="review-title">
          <h3>${escapeHtml(review.title)}</h3>
          <span class="priority ${review.priority.toLowerCase()}">
            ${review.priority}
          </span>
        </div>

        <p>
          Developer:
          <strong>${escapeHtml(review.developer)}</strong>
        </p>

        <p>
          Reviewer:
          <strong>${escapeHtml(review.reviewer)}</strong>
        </p>
      </div>

      <div class="review-actions">
        <label>Status</label>

        <select class="status-select" data-id="${review.id}">
          ${statuses.map((status) => `
            <option ${status === review.status ? "selected" : ""}>
              ${status}
            </option>
          `).join("")}
        </select>

        <button
          class="delete"
          data-action="delete"
          data-id="${review.id}"
        >
          Delete
        </button>
      </div>
    </article>
  `).join("");
}

async function updateStats() {
  const response = await fetch("/api/reviews");
  const reviews = await response.json();

  const cards = [
    ["Total", reviews.length],
    ["Open", countStatus(reviews, "Open")],
    ["In Review", countStatus(reviews, "In Review")],
    ["Approved", countStatus(reviews, "Approved")],
    ["Merged", countStatus(reviews, "Merged")]
  ];

  statsContainer.innerHTML = cards.map(([label, value]) => `
    <div class="stat">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function countStatus(reviews, status) {
  return reviews.filter((review) => review.status === status).length;
}

async function changeStatus(id, status) {
  await fetch(`/api/reviews/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  await loadReviews();
}

async function deleteReview(id) {
  await fetch(`/api/reviews/${id}`, {
    method: "DELETE"
  });

  await loadReviews();
}

reviewsContainer.addEventListener("change", (event) => {
  if (event.target.classList.contains("status-select")) {
    const id = Number(event.target.dataset.id);

    changeStatus(id, event.target.value);
  }
});

reviewsContainer.addEventListener("click", (event) => {
  if (event.target.dataset.action === "delete") {
    const id = Number(event.target.dataset.id);

    deleteReview(id);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    title: document.getElementById("title").value,
    developer: document.getElementById("developer").value,
    reviewer: document.getElementById("reviewer").value,
    priority: document.getElementById("priority").value
  };

  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const result = await response.json();
    message.textContent = result.error;
    return;
  }

  form.reset();
  message.textContent = "Review request created.";

  await loadReviews();
});

filter.addEventListener("change", loadReviews);

async function checkHealth() {
  try {
    const response = await fetch("/health");
    const result = await response.json();

    health.textContent =
      result.status === "ok"
        ? "● Online"
        : "● Offline";
  } catch {
    health.textContent = "● Offline";
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[character]));
}
loadReviews();
checkHealth();
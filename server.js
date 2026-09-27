const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const reviews = [
  {
    id: 1,
    title: "Authentication API Review",
    developer: "Rahul",
    reviewer: "Priya",
    priority: "High",
    status: "In Review"
  },
  {
    id: 2,
    title: "Dashboard UI Review",
    developer: "Amit",
    reviewer: "Neha",
    priority: "Medium",
    status: "Open"
  },
  {
    id: 3,
    title: "Database Service Review",
    developer: "Rohan",
    reviewer: "Priya",
    priority: "High",
    status: "Approved"
  },
  {
    id: 4,
    title: "Notification Feature Review",
    developer: "Sneha",
    reviewer: "Amit",
    priority: "Low",
    status: "Merged"
  }
];

const allowedStatuses = [
  "Open",
  "In Review",
  "Changes Requested",
  "Approved",
  "Merged"
];

const allowedPriorities = [
  "Low",
  "Medium",
  "High"
];

/*
 * Health check
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

/*
 * Get all reviews
 *
 * Optional filters:
 * /api/reviews?status=Open
 * /api/reviews?q=authentication
 * /api/reviews?status=Open&q=dashboard
 */
app.get("/api/reviews", (req, res) => {
  const { status, q } = req.query;

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: "Invalid status filter."
    });
  }

  const searchTerm = q
    ? q.trim().toLowerCase()
    : "";

  let result = reviews;

  /*
   * Filter by status.
   */
  if (status) {
    result = result.filter(
      (review) => review.status === status
    );
  }

  /*
   * Search title, developer and reviewer.
   */
  if (searchTerm) {
    result = result.filter((review) => {
      return (
        review.title
          .toLowerCase()
          .includes(searchTerm) ||
        review.developer
          .toLowerCase()
          .includes(searchTerm) ||
        review.reviewer
          .toLowerCase()
          .includes(searchTerm)
      );
    });
  }

  return res.json(result);
});

/*
 * Get review statistics
 */
app.get("/api/reviews/stats", (req, res) => {
  const stats = {
    total: reviews.length,

    open: reviews.filter(
      (review) => review.status === "Open"
    ).length,

    inReview: reviews.filter(
      (review) => review.status === "In Review"
    ).length,

    changesRequested: reviews.filter(
      (review) =>
        review.status === "Changes Requested"
    ).length,

    approved: reviews.filter(
      (review) => review.status === "Approved"
    ).length,

    merged: reviews.filter(
      (review) => review.status === "Merged"
    ).length
  };

  return res.json(stats);
});

/*
 * Get one review
 */
app.get("/api/reviews/:id", (req, res) => {
  const id = Number(req.params.id);

  const review = reviews.find(
    (item) => item.id === id
  );

  if (!review) {
    return res.status(404).json({
      error: "Review not found."
    });
  }

  return res.json(review);
});

/*
 * Create a review
 */
app.post("/api/reviews", (req, res) => {
  const {
    title,
    developer,
    reviewer,
    priority
  } = req.body;

  /*
   * Remove unnecessary spaces from user input.
   */
  const cleanTitle = title?.trim();
  const cleanDeveloper = developer?.trim();
  const cleanReviewer = reviewer?.trim();

  /*
   * Reject missing or whitespace-only fields.
   */
  if (
    !cleanTitle ||
    !cleanDeveloper ||
    !cleanReviewer ||
    !priority
  ) {
    return res.status(400).json({
      error:
        "Title, developer, reviewer and priority are required."
    });
  }

  /*
   * Validate priority.
   */
  if (!allowedPriorities.includes(priority)) {
    return res.status(400).json({
      error: "Invalid priority."
    });
  }

  /*
   * Generate the next review ID.
   */
  const newReview = {
    id: reviews.length > 0
      ? Math.max(
          ...reviews.map((review) => review.id)
        ) + 1
      : 1,

    title: cleanTitle,
    developer: cleanDeveloper,
    reviewer: cleanReviewer,
    priority,
    status: "Open"
  };

  reviews.push(newReview);

  return res.status(201).json(newReview);
});

/*
 * Update review status
 */
app.put("/api/reviews/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const review = reviews.find(
    (item) => item.id === id
  );

  if (!review) {
    return res.status(404).json({
      error: "Review not found."
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: "Invalid status."
    });
  }

  review.status = status;

  return res.json(review);
});

/*
 * Delete review
 */
app.delete("/api/reviews/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = reviews.findIndex(
    (item) => item.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Review not found."
    });
  }

  reviews.splice(index, 1);

  return res.status(204).send();
});

/*
 * Frontend fallback
 *
 * Express 5 does not support app.get("*"),
 * so app.use() is used here.
 */
app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

/*
 * Start server only when this file
 * is run directly.
 *
 * This allows automated tests to import
 * the Express application without starting
 * another server.
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `CodeFlow running on port ${PORT}`
    );
  });
}

module.exports = {
  app,
  reviews
};
const test = require("node:test");
const assert = require("node:assert");
const { app } = require("../server");

const PORT = 3456;

let server;

test.before(() => {
  server = app.listen(PORT);
});

test.after(() => {
  server.close();
});

async function request(path, options = {}) {
  return fetch(`http://localhost:${PORT}${path}`, options);
}

/*
 * Test 1:
 * Health endpoint
 */
test("health endpoint returns ok", async () => {
  const response = await request("/health");

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.status, "ok");
});

/*
 * Test 2:
 * Create a review
 */
test("POST creates a review", async () => {
  const response = await request("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Test Review",
      developer: "Test Developer",
      reviewer: "Test Reviewer",
      priority: "Medium"
    })
  });

  assert.equal(response.status, 201);

  const data = await response.json();

  assert.equal(data.title, "Test Review");
  assert.equal(data.developer, "Test Developer");
  assert.equal(data.reviewer, "Test Reviewer");
  assert.equal(data.priority, "Medium");
  assert.equal(data.status, "Open");
});

/*
 * Test 3:
 * Validation
 */
test("POST rejects missing fields", async () => {
  const response = await request("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Incomplete Review"
    })
  });

  assert.equal(response.status, 400);

  const data = await response.json();

  assert.equal(
    data.error,
    "Title, developer, reviewer and priority are required."
  );
});

/*
 * Test 4:
 * Update review status
 */
test("status can be updated", async () => {
  const response = await request("/api/reviews/1/status", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status: "Approved"
    })
  });

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.id, 1);
  assert.equal(data.status, "Approved");
});

/*
 * Test 5:
 * Statistics endpoint
 */
test("review statistics endpoint returns counts", async () => {
  const response = await request("/api/reviews/stats");

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(typeof data.total, "number");
  assert.equal(typeof data.open, "number");
  assert.equal(typeof data.inReview, "number");
  assert.equal(typeof data.changesRequested, "number");
  assert.equal(typeof data.approved, "number");
  assert.equal(typeof data.merged, "number");
});

/*
 * Test 6:
 * Invalid status
 */
test("invalid status is rejected", async () => {
  const response = await request("/api/reviews/1/status", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status: "Invalid Status"
    })
  });

  assert.equal(response.status, 400);
});

/*
 * Test 7:
 * Invalid priority
 */
test("invalid priority is rejected", async () => {
  const response = await request("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Invalid Priority Test",
      developer: "Developer",
      reviewer: "Reviewer",
      priority: "Very High"
    })
  });

  assert.equal(response.status, 400);
});

/*
 * Test 8:
 * Search by title
 */
test("search finds review by title", async () => {
  const response = await request(
    "/api/reviews?q=Authentication"
  );

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.ok(
    data.some(
      (review) =>
        review.title === "Authentication API Review"
    )
  );
});

/*
 * Test 9:
 * Search by developer
 */
test("search finds review by developer", async () => {
  const response = await request(
    "/api/reviews?q=Rahul"
  );

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.ok(
    data.some(
      (review) => review.developer === "Rahul"
    )
  );
});

/*
 * Test 10:
 * Search by reviewer
 */
test("search finds review by reviewer", async () => {
  const response = await request(
    "/api/reviews?q=Priya"
  );

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.ok(
    data.some(
      (review) => review.reviewer === "Priya"
    )
  );
});

/*
 * Test 11:
 * Whitespace-only input is rejected
 */
test("POST rejects whitespace-only input", async () => {
  const response = await request("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "   ",
      developer: "Developer",
      reviewer: "Reviewer",
      priority: "Low"
    })
  });

  assert.equal(response.status, 400);

  const data = await response.json();

  assert.equal(
    data.error,
    "Title, developer, reviewer and priority are required."
  );
});

/*
 * Test 12:
 * Input whitespace is trimmed
 */
test("POST trims unnecessary whitespace", async () => {
  const response = await request("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "  Trimmed Review  ",
      developer: "  Test Developer  ",
      reviewer: "  Test Reviewer  ",
      priority: "Low"
    })
  });

  assert.equal(response.status, 201);

  const data = await response.json();

  assert.equal(data.title, "Trimmed Review");
  assert.equal(data.developer, "Test Developer");
  assert.equal(data.reviewer, "Test Reviewer");
});
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

let reviews = [
  { id: 1, title: "Add authentication", developer: "Ankit", reviewer: "Rahul", priority: "High", status: "Open" },
  { id: 2, title: "Improve dashboard UI", developer: "Priya", reviewer: "Aarav", priority: "Medium", status: "In Review" }
];
let nextId = 3;

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/reviews", (req, res) => {
  const status = req.query.status;
  if (!status) return res.json(reviews);
  return res.json(reviews.filter((review) => review.status === status));
});

app.post("/api/reviews", (req, res) => {
  const { title, developer, reviewer, priority } = req.body;
  if (!title || !developer || !reviewer || !priority) {
    return res.status(400).json({ error: "Title, developer, reviewer and priority are required." });
  }
  if (!["Low", "Medium", "High"].includes(priority)) {
    return res.status(400).json({ error: "Priority must be Low, Medium or High." });
  }
  const review = { id: nextId++, title, developer, reviewer, priority, status: "Open" };
  reviews.push(review);
  return res.status(201).json(review);
});

app.put("/api/reviews/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const allowed = ["Open", "In Review", "Changes Requested", "Approved", "Merged"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid review status." });
  const review = reviews.find((item) => item.id === id);
  if (!review) return res.status(404).json({ error: "Review not found." });
  review.status = status;
  return res.json(review);
});

app.delete("/api/reviews/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = reviews.findIndex((item) => item.id === id);
  if (index === -1) return res.status(404).json({ error: "Review not found." });
  reviews.splice(index, 1);
  return res.status(204).send();
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (require.main === module) app.listen(PORT, () => console.log(`CodeFlow running on port ${PORT}`));
module.exports = { app, reviews };

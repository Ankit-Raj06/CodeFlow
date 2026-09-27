# CodeFlow

CodeFlow is a web-based Pull Request Review Management System.

It allows developers and reviewers to manage review requests through
different workflow stages such as Open, In Review, Approved and Merged.

## Features

- Create review requests
- View all review requests
- Search reviews
- Filter reviews by status
- Update review status
- Delete review requests
- Review statistics dashboard
- Input validation
- Automated API testing
- ESLint code quality checking
- Docker support
- GitHub Actions CI/CD

## Technology Stack

### Backend

- Node.js
- Express.js

### Frontend

- HTML
- CSS
- JavaScript

### Testing

- Node.js built-in test runner
- Fetch API

### Code Quality

- ESLint

### DevOps

- Git
- GitHub
- GitHub Actions
- Docker

## Project Structure

```text
CodeFlow/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── test/
│   └── server.test.js
│
├── .dockerignore
├── .gitignore
├── Dockerfile
├── eslint.config.js
├── package.json
├── package-lock.json
├── README.md
├── REPORT_TEMPLATE.md
└── server.js
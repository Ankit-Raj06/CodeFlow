# CodeFlow — Pull Request Review Management Platform

CodeFlow is a simple web application for managing software code-review requests.

## Features
- Create review requests
- Assign a developer and reviewer
- Set review priority
- Move reviews through Open → In Review → Changes Requested → Approved → Merged
- Filter reviews by status
- Delete review requests
- REST API
- Health endpoint
- Automated tests
- ESLint
- Docker
- GitHub Actions CI/CD
- Render deployment

## Technology
Node.js, Express, JavaScript, Node.js built-in test runner, ESLint, Docker, GitHub Actions and Render.

## Run locally
```bash
npm install
npm run lint
npm test
npm start
```
Open http://localhost:3000

## API
- `GET /api/reviews`
- `GET /api/reviews?status=Approved`
- `POST /api/reviews`
- `PUT /api/reviews/:id/status`
- `DELETE /api/reviews/:id`
- `GET /health`

## CI/CD
Git push → ESLint → Tests → Docker build → Docker smoke test → Render deployment.

The build job depends on the quality job, and deployment depends on the build job. A failed quality/build stage therefore prevents deployment.

## Render
Create a Render Web Service connected to this repository, use Docker, and set `/health` as the health-check path. Create a Render Deploy Hook and store it in GitHub Actions as `RENDER_DEPLOY_HOOK`.

## CCA 2
Create meaningful commits and at least one feature branch/merged pull request. Demonstrate one intentionally failed Actions run followed by a corrected green run. Customize the UI, sample data, wording and at least one feature before submission so the repository represents your own work.

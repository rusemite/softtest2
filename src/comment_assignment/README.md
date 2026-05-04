# Social Media Comment Management Application

This project is a simple web application for managing comments in a social media context. It includes a RESTful API, a web interface, and comprehensive automated tests.

## Project Structure
- `src/comment_assignment/`
  - `app.js`: Express application configuration.
  - `server.js`: Server entry point.
  - `db.js`: Database connection (PostgreSQL).
  - `schema.sql`: Database schema for the `comments` table.
  - `routes/comments.js`: API endpoints for CRUD operations.
  - `public/`: Frontend files (HTML, JS).
  - `api-tests.http`: HTTP client-based API tests (Criterion 2).
  - `tests/api.test.js`: Jest & SuperTest API tests.
  - `cypress/`: E2E tests.
  - `load-test.yml`: Artillery load testing configuration.
  - `LOAD_TEST_REPORT.md`: Report analyzing the API performance.

## Prerequisites
- Node.js installed.
- PostgreSQL database running.
- Update `.env` file in the root directory with your database credentials.

## Installation
```bash
npm install
```

## Running the Application
1. Run the SQL in `schema.sql` on your PostgreSQL database.
2. Start the server:
   ```bash
   npm run start:comment
   ```
3. Open `http://localhost:3000` in your browser.

## Running Tests

### 1. HTTP Client API Testing (Criterion 2)
Open `src/comment_assignment/api-tests.http` in your IDE (WebStorm or VS Code with REST Client) and run the requests to verify the API manually.

### 2. API Tests (Jest & SuperTest - Criterion 3)
These tests mock the database operations.
```bash
npm run test:api
```

### 3. End-to-End Tests (Cypress - Criterion 4)
Ensure the server is running or uses intercepts (already configured in tests).
```bash
npm run test:e2e
```

### 4. Load Testing (Artillery - Criterion 5)
Ensure the server is running.
```bash
npm run test:load
```

## Features
- **CRUD Operations:** Create, Read, Update, and Delete comments.
- **API Mocking:** Database operations are mocked for Jest tests to ensure isolation.
- **Coverage:** High test coverage for API routes.
- **Performance:** Load testing conducted to ensure system stability under concurrent requests.

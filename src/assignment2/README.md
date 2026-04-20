# Assignment 2: Student and Course Management System

This project is a REST API developed with Node.js, Express, and PostgreSQL.

## Project Structure
- `src/assignment2/app.js`: Main Express application.
- `src/assignment2/db.js`: Database connection using `pg` pool.
- `src/assignment2/schema.sql`: PostgreSQL relational schema.
- `src/assignment2/routes/`: CRUD routes for students, courses, and enrollments.
- `src/assignment2/ecosystem.config.js`: PM2 configuration for running instances on ports 3000 and 4000.
- `src/test/assignment2/api.test.js`: Functional tests using Jest and SuperTest.
- `src/assignment2/api-tests.http`: IntelliJ HTTP Client tests.
- `src/assignment2/http-client.env.json`: Environment variables for IntelliJ HTTP Client.

## Database Setup Instructions
Since I cannot create the PostgreSQL database directly in this environment, please follow these steps:

1. **Install PostgreSQL**: Ensure you have PostgreSQL installed on your machine.
2. **Create Database**: Create a new database named `student_management`.
   ```sql
   CREATE DATABASE student_management;
   ```
3. **Run Schema**: Execute the SQL commands in `src/assignment2/schema.sql` to create the tables.
   ```bash
   psql -d student_management -f src/assignment2/schema.sql
   ```
4. **Configure Environment**: Create a `.env` file in the project root (or set environment variables) with your database credentials:
   ```env
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_NAME=student_management
   DB_PORT=5432
   ```

## Running the Application
You can run the application using PM2 to manage two instances on ports 3000 and 4000.

1. **Install PM2** (if not already installed):
   ```bash
   npm install -g pm2
   ```
2. **Start Instances**:
   ```bash
   pm2 start src/assignment2/ecosystem.config.js
   ```
3. **Monitor**:
   ```bash
   pm2 list
   ```

## Testing
### Automated Testing (Jest & SuperTest)
Run the following command to execute the test suite and generate a coverage report:
```bash
npm run test:coverage -- src/test/assignment2/api.test.js
```

### Manual Testing (IntelliJ HTTP Client)
1. Open `src/assignment2/api-tests.http` in WebStorm/IntelliJ.
2. Select either `dev` (port 3000) or `prod` (port 4000) environment.
3. Run the requests to verify API behavior.

## Grading System
Final grades are calculated automatically when calling `GET /api/enrollments/:id/final-grade` based on:
- Assignment 1: 15%
- Assignment 2: 15%
- Midterm Exam: 30%
- Final Exam: 30%
- Final Project: 10%

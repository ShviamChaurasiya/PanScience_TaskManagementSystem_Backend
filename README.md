# Task Management System - Backend

This is the backend API for the Task Management System. It handles user authentication, task CRUD operations, and role-based access control (admin and user roles).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Role-based Access](#role-based-access)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- User registration with email, password hashing (bcrypt)
- User login with JWT authentication
- Role-based access control (User, Admin)
- Task management (create, read, update, delete)
- File/document uploads attached to tasks
- API validation and error handling

---

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (or other supported DB)
- bcryptjs for password hashing
- jsonwebtoken for JWT
- multer (for file uploads)

---

## Setup & Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/task-management-backend.git
   cd task-management-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Setup your database and Prisma schema:

   - Configure your database URL in `.env` file (see [Environment Variables](#environment-variables)).
   - Then run Prisma migrations:

     ```bash
     npx prisma migrate dev --name init
     ```

4. Start the server:

   ```bash
   npm run dev
   ```

   The server will run at `http://localhost:5000` by default.

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=your_database_connection_url
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

- `DATABASE_URL` - your PostgreSQL connection string or other supported DB URL
- `JWT_SECRET` - secret key for signing JWT tokens
- `PORT` - optional, defaults to 5000

---

## API Endpoints

### Auth

#### POST `/auth/register`

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user" // optional, defaults to 'user'
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### POST `/auth/login`

Login an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "user"
  }
}
```

---

### Tasks

All `/tasks` endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

- `GET /tasks` - Get tasks assigned to the authenticated user.
- `GET /tasks/all` - (Admin only) Get all tasks in the system.
- `POST /tasks` - Create a new task.
- `PUT /tasks/:id` - Update a task by ID.
- `DELETE /tasks/:id` - Delete a task by ID.

---

## Authentication

JWT token is required for all protected routes.

- Include the token in the Authorization header with format: `Bearer <token>`.
- Tokens expire after 7 days.

---

## Role-based Access

- Users with role: `"admin"` can view and manage all tasks.
- Regular users can only view and manage their own tasks.
- Admin-only endpoints are protected and return `403 Forbidden` if accessed by non-admin users.



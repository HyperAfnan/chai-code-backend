# chai-code-backend

A backend project built while following the "Chai aur Code" backend playlist, focusing on modern JavaScript practices, modular architecture, and clear code organization.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Project Overview

**chai-code-backend** is a learning-oriented backend server project based on the Chai aur Code playlist. It leverages Node.js and modern JavaScript to provide a clear, scalable foundation for backend services, emphasizing best practices in structure and maintainability.

---

## Features

- Express.js server setup
- Modular file and folder organization
- Environment-based configuration
- Middleware support (custom and third-party)
- Utilities for common tasks
- Database integration (likely via `/src/db`)
- Ready-to-extend component structure

---

## Tech Stack

- **Language:** JavaScript (Node.js)
- **Framework:** Express.js (inferred from structure)
- **Database:** (Configured via `/src/db`; exact DB can be specified in `.env`)
- **Linting:** ESLint
- **Formatting:** Prettier

---

## Repository Structure

```
chai-code-backend/
│
├── .gitignore
├── .prettierignore
├── .prettierrc
├── eslint.config.js
├── package.json
├── Readme.md
│
├── public/                # Static assets (if used)
│
└── src/
    ├── app.js             # Main Express application setup
    ├── index.js           # Application entry point
    ├── components/        # Modular components (routes, controllers, etc.)
    ├── db/                # Database connection/configuration
    ├── middlewares/       # Express middlewares (auth, error handling, etc.)
    └── utils/             # Utility/helper functions
```

---

## Architecture

**Layered and Modular Architecture:**

- **Entry Point:**

  - `src/index.js` starts the server and runs the main application.
  - `src/app.js` sets up the Express app, middleware, and routes.

- **Components:**

  - `src/components/` is intended for modular features (controllers, routes, business logic).

- **Database:**

  - `src/db/` handles database configuration and connection logic.

- **Middlewares:**

  - `src/middlewares/` contains Express middleware functions (e.g., authentication, error handling, logging).

- **Utils:**

  - `src/utils/` provides helper functions and utilities for use throughout the project.

- **Static Files:**

  - `public/` can serve static assets if needed.

- **Configuration:**
  - Linting and formatting are enforced with ESLint and Prettier configs.
  - Environment variables should be defined in a `.env` file (see below).

---

## Environment Variables

Define all sensitive and environment-specific variables in a `.env` file at the root.

**Example:**

```
PORT=5000

MONGODB_URI=your mongodb uri
ACCESS_TOKEN_SECRET="your access token secret"
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET="your refresh token secret"
REFRESH_TOKEN_EXPIRY=10d
CONFIRMATION_TOKEN_SECRET="your confirmation token secret"
CONFIRMATION_TOKEN_EXPIRY=2h

CLOUDINARY_CLOUD_NAME=your cloudinary cloud name
CLOUDINARY_API_SECRET=your cloudinary api secret
CLOUDINARY_API_KEY=your cloudinary api key

NODE_ENV=development

```

> Add any other variables as required by your database or third-party services.

---

## Setup & Installation

1. **Clone the repository**

   ```sh
   git clone https://github.com/HyperAfnan/chai-code-backend.git
   cd chai-code-backend
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Lint and format code (optional)**
   ```sh
   npm run lint
   ```

---

## Running the Application

**Development mode:**

```sh
npm run dev
```

**Production mode:**

```sh
npm start
```

---

## Scripts

- `npm run dev` — Start server in development mode (with hot reload if configured)
- `npm start` — Start server in production mode
- `npm run lint` — Lint codebase using ESLint

---

## Troubleshooting

- **Database Errors:** Confirm your database service is running and `.env` variables are set correctly.
- **Port Conflicts:** Edit the `PORT` variable in your `.env` file.
- **Linting/Prettier:** Run `npm run lint` to check for formatting/linting issues.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

**Happy Coding! 🚀**

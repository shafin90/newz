# Multilingual News Management API

This project is a secure, well-architected Express.js server using TypeScript, following the MVC pattern, with Mongoose for MongoDB, and JWT authentication. It allows an admin to manage news posts in 8 languages (English, German, Spanish, French, Italian, Russian, Arabic, Turkish).

## Features
- Admin authentication (JWT)
- CRUD operations for news posts in 8 languages
- Follows MVC pattern and software engineering best practices
- Input validation and sanitization
- Security best practices (Helmet, rate limiting, etc.)

## Project Structure
```
/src
  /config         # Configuration (DB, JWT, etc.)
  /controllers    # Business logic for news, auth, etc.
  /models         # Mongoose schemas/models
  /routes         # Express routers
  /middlewares    # Auth, error handling, validation, etc.
  /services       # (Optional) Business logic helpers
  /utils          # Utility functions
  /types          # TypeScript types/interfaces
  app.ts          # Express app setup
  server.ts       # Entry point
```

## Setup
1. Install dependencies: `npm install`
2. Set up your `.env` file (see `.env.example`)
3. Run the server: `npm run dev`

## Endpoints
- `POST /api/auth/login` (admin login)
- `GET /api/news` (list news, public)
- `POST /api/news` (create news, admin)
- `PUT /api/news/:id` (update news, admin)
- `DELETE /api/news/:id` (delete news, admin)

## Load Balancing & Clustering
For production, you should run multiple instances of this server and use a process manager (like PM2) or a reverse proxy (like Nginx) for load balancing. Example with PM2:

```
pm install -g pm2
pm run build
pm start
pm2 start dist/server.js -i max # Runs as many instances as CPU cores
```

You can also use the Node.js cluster module for basic clustering.

## License
MIT 
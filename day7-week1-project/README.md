# Notes REST API

A production-structured REST API for managing notes, built with Node.js and Express.

## Tech Stack
- Node.js + Express
- Zod (input validation)
- dotenv (environment config)

## Getting Started

### Prerequisites
- Node.js 18+

### Installation
git clone <your-repo-url>
cd day7-notes-api
npm install
cp .env.example .env
npm run dev

## API Endpoints

### Notes
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | /v1/health                | Health check             |
| GET    | /v1/notes                 | Get all notes            |
| POST   | /v1/notes                 | Create a note            |
| GET    | /v1/notes/stats           | Get notes statistics     |
| GET    | /v1/notes/:id             | Get one note             |
| PATCH  | /v1/notes/:id             | Update a note            |
| DELETE | /v1/notes/:id             | Delete a note            |
| POST   | /v1/notes/:id/pin         | Toggle pin status        |
| POST   | /v1/notes/:id/archive     | Toggle archive status    |
| DELETE | /v1/notes/bulk            | Delete multiple notes    |

## Query Parameters (GET /v1/notes)
| Param      | Type    | Description                        |
|------------|---------|------------------------------------|
| page       | number  | Page number (default: 1)           |
| limit      | number  | Items per page (default: 10)       |
| sort       | string  | id, title, createdAt, updatedAt    |
| order      | string  | asc or desc (default: desc)        |
| search     | string  | Search in title and content        |
| tag        | string  | Filter by tag                      |
| isPinned   | boolean | Filter pinned notes                |
| isArchived | boolean | Filter archived notes              |
| color      | string  | Filter by color                    |

## Environment Variables
See .env.example for all required variables.

## Project Structure
src/
  config/       — environment config
  controllers/  — business logic
  errors/       — custom error classes
  middleware/   — logger, validate, errorHandler
  routes/       — route definitions
  schemas/      — Zod validation schemas
  utils/        — asyncHandler
  app.js        — Express setup
server.js       — entry point
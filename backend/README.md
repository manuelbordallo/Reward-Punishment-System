# Reward-Punishment Backend API

Backend API for the reward and punishment management system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your database settings in `.env`

4. Start development server:
```bash
npm run dev
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
backend/
├── src/
│   └── index.js          # Main application entry point
├── controllers/          # API route controllers
├── services/            # Business logic services
├── repositories/        # Data access layer
├── models/              # Data models and interfaces
├── package.json
└── README.md
```
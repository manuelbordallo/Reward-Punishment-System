# Integration Guide - Reward-Punishment System

## Overview

This guide explains how to set up and run the complete Reward-Punishment System with frontend-backend integration.

## Prerequisites

1. **Node.js** (v20 or higher)
2. **PostgreSQL** (v12 or higher)
3. **React Native CLI** (for mobile development)
4. **Android Studio** or **Xcode** (for mobile testing)

## Quick Start

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb reward_punishment_db

# Run migrations
cd backend
npm run migrate
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Frontend Setup

```bash
cd RewardPunishmentApp
npm install
npm start
```

### 4. Run Integration Tests

```bash
# Make sure backend is running first
node integration-test.js
```

## Environment Configuration

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reward_punishment_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### Frontend (config.ts)
- Development: `http://localhost:3000/api`
- Production: Update API_BASE_URL in config.ts

## API Endpoints

- Health Check: `GET /health`
- Persons: `GET|POST|PUT|DELETE /api/persons`
- Rewards: `GET|POST|PUT|DELETE /api/rewards`
- Punishments: `GET|POST|PUT|DELETE /api/punishments`
- Assignments: `GET|POST|DELETE /api/assignments`
- Scores: `GET /api/scores/total`, `GET /api/scores/weekly`

## Testing

### Integration Tests
```bash
node integration-test.js
```

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd RewardPunishmentApp
npm test
```

## Troubleshooting

### Connection Issues
1. Check if backend server is running on port 3000
2. Verify database connection
3. Check firewall settings
4. Use ConnectionTest component in the app

### Common Errors
- **ECONNREFUSED**: Backend server not running
- **Database connection failed**: Check PostgreSQL service
- **CORS errors**: Verify CORS configuration

## System Startup Script

Use the automated startup script:
```bash
node start-system.js
```

This will start both backend and frontend services automatically.
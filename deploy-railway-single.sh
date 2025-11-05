#!/bin/bash

# Deploy as single Railway service script
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_header "🚂 Railway Single Service Deployment"

echo "This will configure your app to deploy as a single Railway service"
echo "that serves both frontend and backend from one URL."
echo ""

# Create single service configuration
cat > nixpacks.toml << 'EOF'
# Single service Railway deployment
[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.install]
cmds = [
    "cd backend && npm ci --only=production",
    "cd reward-punishment-web && npm ci"
]

[phases.build]
cmds = [
    "cd reward-punishment-web && npm run build",
    "cp -r reward-punishment-web/build backend/public"
]

[start]
cmd = "cd backend && npm start"
EOF

print_status "Created single service nixpacks.toml"

# Update backend to serve frontend
cat > backend/serve-frontend.js << 'EOF'
const express = require('express');
const path = require('path');

function serveFrontend(app) {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Handle React Router - send all non-API requests to index.html
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

module.exports = serveFrontend;
EOF

print_status "Created frontend serving module"

# Update backend index.js to serve frontend
if ! grep -q "serve-frontend" backend/src/index.js; then
    # Add frontend serving to the backend
    cat >> backend/src/index.js << 'EOF'

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const serveFrontend = require('../serve-frontend');
  serveFrontend(app);
}
EOF
    print_status "Updated backend to serve frontend"
fi

# Update frontend API URL for single service
cat > reward-punishment-web/.env.production << 'EOF'
# Single service deployment - API is on same domain
REACT_APP_API_URL=/api
GENERATE_SOURCEMAP=false
EOF

print_status "Updated frontend configuration for single service"

# Update API service to use relative URLs
cat > reward-punishment-web/src/services/api.ts << 'EOF'
import axios from 'axios';
import { Person, Reward, Punishment, Assignment, Score, WeeklyScore } from '../types';

// For single service deployment, use relative URLs
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API Response wrapper type
interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// Person API
export const personApi = {
    getAll: () => api.get<ApiResponse<Person[]>>('/persons'),
    create: (data: { name: string }) => api.post<ApiResponse<Person>>('/persons', data),
    update: (id: number, data: { name: string }) => api.put<ApiResponse<Person>>(`/persons/${id}`, data),
    delete: (id: number) => api.delete(`/persons/${id}`),
};

// Reward API
export const rewardApi = {
    getAll: () => api.get<ApiResponse<Reward[]>>('/rewards'),
    create: (data: { name: string; value: number }) => api.post<ApiResponse<Reward>>('/rewards', data),
    update: (id: number, data: { name: string; value: number }) => api.put<ApiResponse<Reward>>(`/rewards/${id}`, data),
    delete: (id: number) => api.delete(`/rewards/${id}`),
};

// Punishment API
export const punishmentApi = {
    getAll: () => api.get<ApiResponse<Punishment[]>>('/punishments'),
    create: (data: { name: string; value: number }) => api.post<ApiResponse<Punishment>>('/punishments, data),
    update: (id: number, data: { name: string; value: number }) => api.put<ApiResponse<Punishment>>(`/punishments/${id}`, data),
    delete: (id: number) => api.delete(`/punishments/${id}`),
};

// Assignment API
export const assignmentApi = {
    getAll: () => api.get<ApiResponse<Assignment[]>>('/assignments'),
    create: (data: { personIds: number[]; itemType: 'reward' | 'punishment'; itemId: number }) =>
        api.post<ApiResponse<Assignment>>('/assignments', data),
    delete: (id: number) => api.delete(`/assignments/${id}`),
};

// Score API
export const scoreApi = {
    getTotal: () => api.get<ApiResponse<Score[]>>('/scores/total'),
    getWeekly: () => api.get<ApiResponse<WeeklyScore[]>>('/scores/weekly'),
};
EOF

print_status "Updated API service for single service deployment"

# Commit changes
git add .
git commit -m "🚂 Configure Railway single service deployment

- Updated nixpacks.toml for single service build
- Added frontend serving to backend
- Updated API URLs for single service
- Configured build process to include frontend

This deploys both frontend and backend as one Railway service."

print_status "Changes committed"

echo ""
print_header "🎯 Next Steps"
echo ""
echo "1. 🗑️  Delete existing Railway services (optional):"
echo "   - Go to Railway dashboard"
echo "   - Delete both frontend and backend services"
echo ""
echo "2. 🆕 Create new single service:"
echo "   - Click 'New Project' in Railway"
echo "   - Deploy from GitHub repo"
echo "   - Railway will use the new nixpacks.toml configuration"
echo ""
echo "3. 🔧 Set environment variables:"
echo "   NODE_ENV=production"
echo "   USE_SQLITE=true"
echo ""
echo "4. 🚀 Push changes to trigger deployment:"
git push origin main

echo ""
print_status "🎉 Single service configuration complete!"
echo ""
echo "Your app will be available at one URL that serves both:"
echo "- Frontend: https://your-app.up.railway.app"
echo "- API: https://your-app.up.railway.app/api"
EOF

chmod +x deploy-railway-single.sh

print_status "Created single service deployment script"
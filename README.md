# 🏆 Reward & Punishment System

A complete web-based reward and punishment management system with real-time scoring and rankings.

## 🌟 Features

- **👥 Person Management** - Add, edit, and manage people
- **🎁 Reward System** - Create positive point rewards
- **⚠️ Punishment System** - Create negative point penalties
- **📋 Assignment Management** - Assign rewards/punishments to multiple people
- **🏆 Real-time Scoreboard** - View total and weekly rankings
- **📱 Responsive Design** - Works on desktop and mobile
- **🔒 Production Ready** - Docker, health checks, monitoring

## 🚀 Quick Start

### Development
```bash
# Install dependencies
cd backend && npm install
cd ../reward-punishment-web && npm install

# Start development servers
npm run dev
```

### Production Deployment
```bash
# Prepare for deployment
./deploy-to-github.sh

# Deploy locally with Docker
./deploy.sh

# Deploy to cloud platforms
./deploy-cloud.sh
```

## 🌐 Public Deployment (2 Minutes)

### Option 1: Railway (Recommended)
1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Sign up with GitHub
4. Click "New Project" → "Deploy from GitHub repo"
5. Select your repository
6. **Your app is live!** 🎉

### Option 2: Render (Free)
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Deploy as Web Service

### Option 3: One-Command Setup
```bash
# Interactive deployment guide
./deploy-cloud.sh
```

## 📖 Documentation

- **[Public Deployment Guide](PUBLIC-DEPLOYMENT-GUIDE.md)** - Deploy to the internet
- **[Production Deployment](PRODUCTION-DEPLOYMENT.md)** - Local production setup
- **[Deployment README](README-DEPLOYMENT.md)** - Detailed deployment instructions

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express
- **SQLite** database (production-ready)
- **Docker** containerization
- **Health monitoring** and logging

### Frontend
- **React** with TypeScript
- **Redux Toolkit** for state management
- **Responsive CSS** design
- **Nginx** for production serving

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Production
npm run deploy           # Deploy with Docker locally
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
npm run health           # Run health checks

# Testing
npm run test             # Run all tests
npm run integration-test # Run integration tests
```

## 🌍 Live Demo

After deployment, your application will include:

- **Web Interface** - Complete management system
- **REST API** - Full CRUD operations
- **Real-time Updates** - Live scoreboard
- **Mobile Support** - Responsive design
- **Data Persistence** - SQLite database

## 📊 API Endpoints

```
GET    /api/persons      # Get all persons
POST   /api/persons      # Create person
PUT    /api/persons/:id  # Update person
DELETE /api/persons/:id  # Delete person

GET    /api/rewards      # Get all rewards
POST   /api/rewards      # Create reward
PUT    /api/rewards/:id  # Update reward
DELETE /api/rewards/:id  # Delete reward

GET    /api/punishments      # Get all punishments
POST   /api/punishments      # Create punishment
PUT    /api/punishments/:id  # Update punishment
DELETE /api/punishments/:id  # Delete punishment

GET    /api/assignments      # Get all assignments
POST   /api/assignments      # Create assignment
DELETE /api/assignments/:id  # Delete assignment

GET    /api/scores/total     # Get total scores
GET    /api/scores/weekly    # Get weekly scores

GET    /health               # Health check
```

## 🔒 Security Features

- Input validation and sanitization
- CORS configuration
- Security headers (XSS, CSRF protection)
- Rate limiting ready
- Environment variable configuration

## 📱 Screenshots

### Web Interface
- Clean, intuitive design
- Real-time scoreboard with rankings
- Mobile-responsive layout
- Easy person and reward management

### API Response Example
```json
{
  "success": true,
  "data": [
    {
      "personId": 1,
      "personName": "John Doe",
      "totalScore": 25,
      "assignmentCount": 5,
      "averageScore": 5.0,
      "rank": 1
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

- **Deployment Issues**: Check `PUBLIC-DEPLOYMENT-GUIDE.md`
- **Development Setup**: See individual README files in backend/frontend folders
- **Health Monitoring**: Run `./health-check.sh`

---

## 🎯 Quick Deploy Commands

```bash
# 1. Prepare for public deployment
./deploy-to-github.sh

# 2. Choose your platform
./deploy-cloud.sh

# 3. Your app is live! 🌐
```

**Built with ❤️ for easy reward and punishment management**
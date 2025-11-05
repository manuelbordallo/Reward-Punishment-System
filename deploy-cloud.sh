#!/bin/bash

# Cloud deployment script for Reward-Punishment System
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header "🌐 Reward-Punishment System - Cloud Deployment"

echo "Choose your deployment platform:"
echo "1) Railway (Recommended - Easy & Free)"
echo "2) Render (Free tier available)"
echo "3) DigitalOcean App Platform"
echo "4) Heroku"
echo "5) AWS (Advanced)"
echo "6) Google Cloud Run"
echo "7) Manual VPS Setup"
echo ""
read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        print_header "🚂 Railway Deployment"
        echo "Railway is the easiest way to deploy your app publicly!"
        echo ""
        echo "Steps to deploy on Railway:"
        echo "1. Go to https://railway.app"
        echo "2. Sign up with GitHub"
        echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
        echo "4. Select this repository"
        echo "5. Railway will auto-detect and deploy both services"
        echo ""
        echo "Environment variables to set in Railway:"
        echo "- NODE_ENV=production"
        echo "- USE_SQLITE=true"
        echo "- PORT=3000"
        echo ""
        print_status "Your app will be available at: https://your-app-name.up.railway.app"
        ;;
    2)
        print_header "🎨 Render Deployment"
        echo "Render offers free hosting with automatic deployments!"
        echo ""
        echo "Steps to deploy on Render:"
        echo "1. Go to https://render.com"
        echo "2. Sign up with GitHub"
        echo "3. Click 'New' → 'Web Service'"
        echo "4. Connect your GitHub repository"
        echo "5. Use these settings:"
        echo "   - Build Command: npm run build"
        echo "   - Start Command: npm start"
        echo "   - Environment: Node"
        echo ""
        print_status "Your app will be available at: https://your-app-name.onrender.com"
        ;;
    3)
        print_header "🌊 DigitalOcean App Platform"
        echo "DigitalOcean App Platform deployment setup..."
        
        # Create app spec for DigitalOcean
        cat > .do/app.yaml << EOF
name: reward-punishment-system
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/reward-punishment-system
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: USE_SQLITE
    value: "true"
  - key: PORT
    value: "8080"
- name: frontend
  source_dir: /reward-punishment-web
  github:
    repo: your-username/reward-punishment-system
    branch: main
  build_command: npm run build
  run_command: npx serve -s build -l 8080
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
EOF
        
        print_status "Created DigitalOcean app spec at .do/app.yaml"
        echo "1. Push your code to GitHub"
        echo "2. Go to https://cloud.digitalocean.com/apps"
        echo "3. Click 'Create App' → 'GitHub'"
        echo "4. Select your repository and upload the app.yaml file"
        ;;
    4)
        print_header "🟣 Heroku Deployment"
        echo "Heroku deployment setup..."
        
        # Create Procfile for Heroku
        cat > Procfile << EOF
web: cd backend && npm start
EOF
        
        # Create heroku.yml for container deployment
        cat > heroku.yml << EOF
build:
  docker:
    web: Dockerfile.backend
run:
  web: npm start
EOF
        
        print_status "Created Heroku configuration files"
        echo "Steps to deploy on Heroku:"
        echo "1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli"
        echo "2. Run: heroku login"
        echo "3. Run: heroku create your-app-name"
        echo "4. Run: git push heroku main"
        echo ""
        print_warning "Note: Heroku removed free tier. Paid plans start at \$5/month"
        ;;
    5)
        print_header "☁️ AWS Deployment"
        echo "AWS deployment options:"
        echo "1. AWS App Runner (Easiest)"
        echo "2. AWS ECS with Fargate"
        echo "3. AWS EC2 with Docker"
        echo ""
        echo "For AWS App Runner:"
        echo "1. Go to AWS Console → App Runner"
        echo "2. Create service from source code"
        echo "3. Connect your GitHub repository"
        echo "4. Use container configuration"
        echo ""
        print_warning "AWS requires credit card and may incur charges"
        ;;
    6)
        print_header "🏃 Google Cloud Run"
        echo "Google Cloud Run deployment..."
        
        # Create Cloud Run configuration
        cat > cloudbuild.yaml << EOF
steps:
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/\$PROJECT_ID/reward-punishment-backend', '-f', 'Dockerfile.backend', '.']
  
  # Build frontend  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/\$PROJECT_ID/reward-punishment-frontend', '-f', 'Dockerfile.frontend', '.']

  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/\$PROJECT_ID/reward-punishment-backend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/\$PROJECT_ID/reward-punishment-frontend']

  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'reward-punishment-system', '--image', 'gcr.io/\$PROJECT_ID/reward-punishment-backend', '--platform', 'managed', '--region', 'us-central1', '--allow-unauthenticated']
EOF
        
        print_status "Created Google Cloud Build configuration"
        echo "Steps:"
        echo "1. Enable Cloud Run API in Google Cloud Console"
        echo "2. Run: gcloud builds submit --config cloudbuild.yaml"
        ;;
    7)
        print_header "🖥️ Manual VPS Setup"
        echo "VPS deployment instructions..."
        
        # Create VPS setup script
        cat > setup-vps.sh << 'EOF'
#!/bin/bash
# VPS Setup Script for Ubuntu/Debian

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (for SSL termination)
sudo apt install nginx certbot python3-certbot-nginx -y

# Clone repository
git clone https://github.com/your-username/reward-punishment-system.git
cd reward-punishment-system

# Deploy application
./deploy.sh

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d your-domain.com

echo "Setup complete! Your app is running on your VPS."
EOF
        
        chmod +x setup-vps.sh
        print_status "Created VPS setup script: setup-vps.sh"
        echo ""
        echo "VPS Providers (Recommended):"
        echo "- DigitalOcean Droplets (\$5/month)"
        echo "- Linode (\$5/month)"
        echo "- Vultr (\$3.50/month)"
        echo "- AWS EC2 t3.micro (Free tier)"
        echo ""
        echo "Steps:"
        echo "1. Create a VPS with Ubuntu 20.04+"
        echo "2. Upload this script to your VPS"
        echo "3. Run: chmod +x setup-vps.sh && ./setup-vps.sh"
        echo "4. Point your domain to the VPS IP address"
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_header "📋 Next Steps"
echo "1. Push your code to GitHub if you haven't already"
echo "2. Follow the platform-specific instructions above"
echo "3. Set up your custom domain (optional)"
echo "4. Configure SSL/HTTPS for security"
echo ""
print_status "🎉 Your app will be publicly accessible once deployed!"
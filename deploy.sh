#!/bin/bash

# Deployment script for Reward-Punishment System
set -e

echo "🚀 Starting deployment of Reward-Punishment System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p data logs

# Set permissions
chmod 755 data logs

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.production .env
    print_warning "Please review and update the .env file with your production settings."
fi

# Build and start services
print_status "Building Docker images..."
docker-compose -f docker-compose.yml build --no-cache

print_status "Starting services..."
docker-compose -f docker-compose.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose -f docker-compose.yml ps | grep -q "Up"; then
    print_status "✅ Services are running successfully!"
    
    # Display service URLs
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost"
    echo "   Backend API: http://localhost/api"
    echo "   Health Check: http://localhost/health"
    echo ""
    
    # Display logs command
    echo "📋 Useful commands:"
    echo "   View logs: docker-compose -f docker-compose.yml logs -f"
    echo "   Stop services: docker-compose -f docker-compose.yml down"
    echo "   Restart services: docker-compose -f docker-compose.yml restart"
    echo ""
    
else
    print_error "❌ Some services failed to start. Check logs with:"
    echo "docker-compose -f docker-compose.yml logs"
    exit 1
fi

print_status "🎉 Deployment completed successfully!"
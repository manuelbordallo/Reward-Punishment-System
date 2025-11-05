#!/bin/bash

# Health check script for production monitoring
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

echo "🏥 Reward-Punishment System Health Check"
echo "========================================"

# Check if Docker containers are running
echo "Checking Docker containers..."
if docker-compose ps | grep -q "Up"; then
    print_status "Docker containers are running"
else
    print_error "Docker containers are not running"
    exit 1
fi

# Check frontend health
echo "Checking frontend..."
if curl -f -s http://localhost/ > /dev/null; then
    print_status "Frontend is accessible"
else
    print_error "Frontend is not accessible"
fi

# Check backend health
echo "Checking backend API..."
if curl -f -s http://localhost/health > /dev/null; then
    print_status "Backend API is healthy"
    
    # Get health details
    HEALTH_RESPONSE=$(curl -s http://localhost/health)
    echo "   Status: $(echo $HEALTH_RESPONSE | jq -r '.status' 2>/dev/null || echo 'Unknown')"
else
    print_error "Backend API is not healthy"
fi

# Check API endpoints
echo "Checking API endpoints..."
ENDPOINTS=("/api/persons" "/api/rewards" "/api/punishments" "/api/scores/total")

for endpoint in "${ENDPOINTS[@]}"; do
    if curl -f -s "http://localhost$endpoint" > /dev/null; then
        print_status "Endpoint $endpoint is working"
    else
        print_error "Endpoint $endpoint is not working"
    fi
done

# Check disk space
echo "Checking disk space..."
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    print_status "Disk usage: ${DISK_USAGE}%"
elif [ "$DISK_USAGE" -lt 90 ]; then
    print_warning "Disk usage: ${DISK_USAGE}% (Warning: High usage)"
else
    print_error "Disk usage: ${DISK_USAGE}% (Critical: Very high usage)"
fi

# Check memory usage
echo "Checking memory usage..."
if command -v free &> /dev/null; then
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$MEMORY_USAGE" -lt 80 ]; then
        print_status "Memory usage: ${MEMORY_USAGE}%"
    elif [ "$MEMORY_USAGE" -lt 90 ]; then
        print_warning "Memory usage: ${MEMORY_USAGE}% (Warning: High usage)"
    else
        print_error "Memory usage: ${MEMORY_USAGE}% (Critical: Very high usage)"
    fi
fi

# Check Docker container health
echo "Checking container health status..."
BACKEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' reward-punishment-backend 2>/dev/null || echo "no-healthcheck")
FRONTEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' reward-punishment-frontend 2>/dev/null || echo "no-healthcheck")

if [ "$BACKEND_HEALTH" = "healthy" ]; then
    print_status "Backend container is healthy"
elif [ "$BACKEND_HEALTH" = "no-healthcheck" ]; then
    print_warning "Backend container has no health check"
else
    print_error "Backend container health: $BACKEND_HEALTH"
fi

if [ "$FRONTEND_HEALTH" = "healthy" ]; then
    print_status "Frontend container is healthy"
elif [ "$FRONTEND_HEALTH" = "no-healthcheck" ]; then
    print_warning "Frontend container has no health check"
else
    print_error "Frontend container health: $FRONTEND_HEALTH"
fi

echo ""
echo "🏥 Health check completed!"
echo "For detailed logs, run: docker-compose logs -f"
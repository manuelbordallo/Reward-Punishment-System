# Reward-Punishment System - Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Port 80 available on your server

### Simple Deployment
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 📋 Deployment Options

### Option 1: Simple Docker Compose (Recommended)
```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Production with PostgreSQL
```bash
# Start with PostgreSQL database
docker-compose -f docker-compose.prod.yml --profile postgres up -d --build

# Or use SQLite (default)
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔧 Configuration

### Environment Variables
Copy `.env.production` to `.env` and configure:

```bash
# Database (SQLite by default)
USE_SQLITE=true

# For PostgreSQL:
# USE_SQLITE=false
# DB_HOST=postgres
# DB_PASSWORD=your_secure_password

# Server
PORT=3000
FRONTEND_PORT=80
```

### Custom Domain
Update `nginx.conf` to change `server_name` from `localhost` to your domain.

## 🌐 Access Points

After deployment, access your application at:
- **Frontend**: http://localhost (or your domain)
- **API**: http://localhost/api
- **Health Check**: http://localhost/health

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Health Checks
```bash
# Check service status
docker-compose ps

# Test health endpoints
curl http://localhost/health
```

## 🔄 Updates

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Backup Data
```bash
# Backup SQLite database
cp data/database.sqlite data/database.sqlite.backup

# Or backup Docker volume
docker run --rm -v reward-punishment-system_reward_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port 80 already in use**
   ```bash
   # Change port in .env
   FRONTEND_PORT=8080
   ```

2. **Database connection issues**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Restart services
   docker-compose restart
   ```

3. **Frontend not loading**
   ```bash
   # Check nginx logs
   docker-compose logs frontend
   
   # Verify API connection
   curl http://localhost/api/persons
   ```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v --remove-orphans

# Remove images
docker-compose down --rmi all

# Start fresh
./deploy.sh
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Change default passwords in `.env`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Configure backup strategy
- [ ] Monitor resource usage

### SSL/HTTPS Setup
For HTTPS, consider using:
- Nginx Proxy Manager
- Traefik
- Let's Encrypt with Certbot

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Use load balancer (nginx, traefik, etc.)
```

### Performance Optimization
- Enable gzip compression (already configured)
- Use CDN for static assets
- Implement Redis for caching
- Monitor with Prometheus/Grafana

## 🆘 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify health checks: `curl http://localhost/health`
3. Check Docker status: `docker-compose ps`
4. Review configuration files

For additional help, check the main README.md file.
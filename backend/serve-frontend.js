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

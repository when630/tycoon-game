import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests
// Fallback to backend service in Docker or VITE_API_URL
const apiTarget = process.env.VITE_API_URL || 'http://backend:8080';
if (apiTarget) {
  console.log(`Setting up proxy to ${apiTarget}`);
  app.use('/api', createProxyMiddleware({
    target: apiTarget,
    changeOrigin: true,
    secure: false, // In case of self-signed certs or issues
  }));
}

// Handle client-side routing by returning index.html for all non-file requests
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

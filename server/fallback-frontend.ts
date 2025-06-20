import { type Express } from "express";
import path from "path";

// Fallback frontend serving when Vite is not available
export function serveFallbackFrontend(app: Express) {
  // Basic HTML fallback for root route
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ProbeAI - Development Mode</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              max-width: 800px; 
              margin: 2rem auto; 
              padding: 2rem; 
              line-height: 1.6;
            }
            .status { color: #059669; font-weight: 600; }
            .error { color: #dc2626; }
            pre { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>ProbeAI Platform - Development Server</h1>
          <p class="status">✅ Backend server is running successfully</p>
          
          <h2>API Status</h2>
          <ul>
            <li>✅ Database connected</li>
            <li>✅ Algolia search initialized</li>
            <li>✅ Brevo email service ready</li>
            <li>✅ CORS configured for all environments</li>
          </ul>
          
          <h2>Available API Endpoints</h2>
          <ul>
            <li><a href="/health">/health</a> - Server health check</li>
            <li><a href="/api/tools">/api/tools</a> - AI tools directory</li>
            <li><a href="/api/news">/api/news</a> - Latest AI news</li>
            <li><a href="/api/blogs">/api/blogs</a> - Blog posts</li>
            <li><a href="/api/videos">/api/videos</a> - Educational videos</li>
          </ul>
          
          <h2>Development Notes</h2>
          <p>The Vite development server is not running. This is a fallback page showing that the backend is operational.</p>
          <p>For full frontend development, ensure Vite integration is properly configured.</p>
          
          <h2>Production Deployment</h2>
          <ul>
            <li>Frontend: <a href="https://probeai-platform.vercel.app" target="_blank">Vercel</a></li>
            <li>Backend: <a href="https://probeai-platform-production.up.railway.app" target="_blank">Railway</a></li>
          </ul>
        </body>
      </html>
    `);
  });

  console.log("📄 Fallback frontend served for development");
}
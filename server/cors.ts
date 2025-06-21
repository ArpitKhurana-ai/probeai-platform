import { type Request, type Response, type NextFunction } from 'express';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  // Debug logging
  console.log(`🔗 CORS - ${req.method} ${req.url} - Origin: ${origin}`);

  // Define allowed origins
  const allowedOrigins = [
    'https://probeai-platform.vercel.app', // Production
    'http://localhost:3000',
    'http://localhost:5173', // Vite default
    'http://localhost:4173', // Vite preview
  ];

  // Check if origin is allowed
  const isLocalhost = origin?.includes('localhost');
  const isVercelPreview = origin?.match(/^https:\/\/probeai-platform(-[\w\d]+)?.*\.vercel\.app$/);
  const isProduction = origin === 'https://probeai-platform.vercel.app';
  const isAllowed = isLocalhost || isVercelPreview || isProduction;

  // ALWAYS set CORS headers (critical for error responses)
  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS - Allowed origin: ${origin}`);
  } else {
    // For debugging - you might want to be more restrictive in production
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    console.log(`⚠️ CORS - Origin not in allowlist but allowing: ${origin}`);
  }

  // Essential CORS headers - ALWAYS set these
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS - Handling OPTIONS preflight for ${req.url}`);
    return res.status(204).end();
  }

  next();
};

// Middleware to ensure CORS headers are added to ALL responses, including errors
export const ensureCorsHeaders = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  const originalJson = res.json;
  const originalStatus = res.status;

  // Override res.send to ensure CORS headers
  res.send = function(body) {
    addCorsHeadersIfMissing(req, res);
    return originalSend.call(this, body);
  };

  // Override res.json to ensure CORS headers
  res.json = function(body) {
    addCorsHeadersIfMissing(req, res);
    return originalJson.call(this, body);
  };

  // Override res.status to ensure CORS headers on status calls
  res.status = function(code) {
    const result = originalStatus.call(this, code);
    addCorsHeadersIfMissing(req, res);
    return result;
  };

  next();
};

function addCorsHeadersIfMissing(req: Request, res: Response) {
  if (!res.getHeader('Access-Control-Allow-Origin')) {
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    console.log(`🔧 CORS - Added missing headers to response`);
  }
}
import { type Request, type Response, type NextFunction } from 'express';

const allowedOrigins = [
  'http://localhost:5000',
  'https://probeai-platform.vercel.app'
];

const vercelPreviewRegex = /^https:\/\/probeai-platform(-[\w\d]+)?-arpits-projects-[\w\d]+\.vercel\.app$/;

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || '';
  const method = req.method;

  const isAllowed =
    allowedOrigins.includes(origin) ||
    vercelPreviewRegex.test(origin);

  console.log('🧪 [CORS Check]');
  console.log('↪ Origin:', origin);
  console.log('↪ Method:', method);
  console.log('↪ Allowed:', isAllowed);

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'BLOCKED');
    console.warn('🚫 Blocked CORS origin:', origin);
  }

  if (method === 'OPTIONS') {
    console.log('⚙️ Preflight OPTIONS request handled');
    return res.status(204).end();
  }

  next();
};

import { type Request, type Response, type NextFunction } from 'express';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  const isLocalhost = origin?.includes('localhost');
  const isVercelPreview = origin?.match(/^https:\/\/probeai-platform(-[\w\d]+)?-arpits-projects-[\w\d]+\.vercel\.app$/);
  const isProduction = origin === 'https://probeai-platform.vercel.app';

  const isAllowed = isLocalhost || isVercelPreview || isProduction;

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};

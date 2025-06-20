import express from "express";
import cors from "cors";
import { router } from "./routes";

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://probeai-platform-production.up.railway.app",
  /^https:\/\/probeai-platform-[\w-]+\.vercel\.app$/, // all Vercel preview domains
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.some((o) =>
          typeof o === "string" ? o === origin : o.test(origin)
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for origin: " + origin));
      }
    },
    credentials: true,
  })
);

// ✅ Debug header + log
app.use((req, res, next) => {
  res.setHeader("X-Debug-CORS-Check", "YES");
  console.log(`🧪 DEBUG CORS MIDDLEWARE: ${req.method} ${req.path} :: Origin = ${req.headers.origin}`);
  next();
});

// ✅ Mount all API routes
app.use("/api", router);

// ✅ Health check route (already exists in repo)
import health from "./health";
app.use("/health", health);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

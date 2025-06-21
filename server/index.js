/*************************************************************************
 *  Probe AI  – Production JS entry                                     *
 *  (Option A: keep JS, inject the new CORS middleware)                 *
 ************************************************************************/

console.log("🚀 ProbeAI backend (JS) starting …");
console.log("Environment:", process.env.NODE_ENV || "development");

const express          = require("express");
const { corsMiddleware } = require("./server/cors");   // ← NEW
const { registerRoutes } = require("./server/routes");
const { initializeBrevo } = require("./server/brevo");

// --------------------------------------------------------------------
// 1️⃣  BOOTSTRAP EXPRESS + CORS  (MUST come before any routes)
// --------------------------------------------------------------------
const app = express();
app.use(corsMiddleware);                               // ← NEW (runs first)

app.get("/cors-check", (req, res) => {                 // ← NEW helper route
  res.json({ ok: true, origin: req.headers.origin });
});

// Existing body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --------------------------------------------------------------------
// 2️⃣  REMAINDER OF ORIGINAL index.js  (unchanged except tiny edits)
// --------------------------------------------------------------------

// … everything that was already in the compiled bundle …
// (routes registration, error handlers, server.listen, etc.)
// ⬇️ KEEP THE REST **EXACTLY** AS IT IS.  Do **not** duplicate the
//   long bundled code here – just leave it untouched in the file.
// --------------------------------------------------------------------

/*  (for brevity, below is a collapsed placeholder in this snippet.
    In your real file, the thousands of lines that follow remain
    unchanged.)                                                    */

////////////////////////////////////////////////////////////////////////////////
//  ↓↓↓  KEEP ORIGINAL COMPILED CODE FROM HERE ↓↓↓
////////////////////////////////////////////////////////////////////////////////

// … (massive bundled code you posted) …

////////////////////////////////////////////////////////////////////////////////
//  ↑↑↑  KEEP ORIGINAL COMPILED CODE ABOVE ↑↑↑
////////////////////////////////////////////////////////////////////////////////

// backend/src/routes/auth.ts
import express from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

const router = express.Router();

// Redirect to GitHub OAuth
router.get("/login", async (req, res) => {
  try {
    const result = await auth.api.signInSocial({
      body: {
        provider: "github",
        callbackURL: `${process.env.BETTER_AUTH_URL || "http://localhost:8080"}/auth/callback/success`,
      },
      headers: fromNodeHeaders(req.headers),
    });

    if (result.url) {
      res.redirect(result.url);
    } else {
      res.status(500).json({ error: "Failed to generate auth URL" });
    }
  } catch (error) {
    console.error("Auth login error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Handle successful login after Better Auth processes the GitHub callback
router.get("/callback/success", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    res.status(401).json({ error: "Authentication failed" });
    return;
  }

  // Return session info for API access
  res.json({
    success: true,
    user: session.user,
    sessionToken: req.headers.cookie,
  });
});

// Simple login page for easier access
router.get("/login-page", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>TillerQuest API Login</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 500px; 
                margin: 100px auto; 
                text-align: center; 
                background: #0f172a; 
                color: white; 
            }
            .btn { 
                background: #7c3aed; 
                color: white; 
                padding: 12px 24px; 
                border: none; 
                border-radius: 6px; 
                cursor: pointer; 
                text-decoration: none; 
                display: inline-block; 
                margin: 10px;
            }
            .btn:hover { background: #6d28d9; }
        </style>
    </head>
    <body>
        <h1>🏰 TillerQuest API Access</h1>
        <p>Authenticate with GitHub to access the API</p>
        <a href="/auth/login" class="btn">🔗 Login with GitHub</a>
        <br><br>
        <p><small>After login, you'll get session info for API calls</small></p>
    </body>
    </html>
  `);
});

export default router;

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import etudiantRoutes from "./routes/etudiantRoutes.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ⭐ RATE LIMITING GLOBAL - Protection sur TOUTES les routes
app.use(rateLimiter);

// Logging des requêtes (après rate limiting pour voir les blocages)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Routes PUBLIQUES (rate limiting seul)
app.use("/auth", authRoutes);

// Routes PROTÉGÉES (rate limiting + authentification)
app.use("/etudiants", authMiddleware, etudiantRoutes);

// Route de test publique
app.get("/test", (req, res) => {
  res.json({ 
    message: "API fonctionne!",
    rate_limiting: "Activé sur toutes les routes",
    endpoints: {
      publics: ["/auth/login", "/auth/register", "/test"],
      protégés: ["/etudiants", "/auth/me/token"]
    }
  });
});

// Route 404 pour les routes non trouvées
app.use("*", (req, res) => {
  res.status(404).json({ 
    message: "Route non trouvée",
    path: req.originalUrl
  });
});

app.listen(3000, () => {
  console.log("✅ Serveur lancé sur http://localhost:3000");
  console.log("📝 Testez: http://localhost:3000/test");
});
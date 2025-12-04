import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Connexion Redis / Memurai
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
});

/**
 * Rate limiting AVANCÉ avec règles spécifiques par endpoint
 * Respecte exactement les consignes :
 * - /auth/me/token : 50 req/5min → blocage 24h
 * - /auth/login : 5 req/15min → blocage 1h  
 * - /etudiants : 20 req/3s → blocage 1h
 * - Autres : 100 req/1min → blocage 1h
 */
export const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;
    const path = req.path; // Récupère le chemin de la route
    const keyBase = `rl:${ip}:${path}`; // Clé spécifique par IP + endpoint

    // RÈGLES SPÉCIFIQUES PAR ENDPOINT
    let rules = [];
    
    // 🔐 ENDPOINT CRITIQUE : Token (sécurité maximale)
    if (path === '/auth/me/token') {
      rules = [
        { limit: 50, window: 300, block: 86400 } // 50 req/5min → blocage 24h
      ];
    }
    // 🛡️ ENDPOINT LOGIN : Anti brute-force
    else if (path === '/auth/login') {
      rules = [
        { limit: 5, window: 900, block: 3600 } // 5 req/15min → blocage 1h
      ];
    }
    // ⚡ ENDPOINT ÉTUDIANTS : QoS application
    else if (path === '/etudiants') {
      rules = [
        { limit: 20, window: 3, block: 3600 } // 20 req/3s → blocage 1h
      ];
    }
    // 📍 AUTRES ENDPOINTS : Protection générale
    else {
      rules = [
        { limit: 5, window: 3*60, block: 3600 } // 100 req/1min → blocage 1h
      ];
    }

    // Vérifier si IP est bloquée pour CET ENDPOINT
    const isBlocked = await redis.get(`${keyBase}:blocked`);
    if (isBlocked) {
      const remainingTime = await redis.ttl(`${keyBase}:blocked`);
      const hours = Math.floor(remainingTime / 3600);
      const minutes = Math.floor((remainingTime % 3600) / 60);
      
      return res.status(429).json({
        message: `⛔ Accès à ${path} bloqué pour ${hours}h${minutes}min suite à un abus`
      });
    }

    // Traitement des règles SPÉCIFIQUES
    for (const rule of rules) {
      const key = `${keyBase}:${rule.window}`;
      let count = await redis.get(key);

      if (!count) {
        // Première requête → création
        await redis.set(key, 1, "EX", rule.window);
        count = 1;
      } else {
        // Incrémentation
        count = await redis.incr(key);
      }

      // Vérification du dépassement
      if (count > rule.limit) {
        // Blocage si nécessaire
        if (rule.block > 0) {
          await redis.set(`${keyBase}:blocked`, 1, "EX", rule.block);
        }

        return res.status(429).json({
          message: `🚨 Trop de requêtes sur ${path}! Limite: ${rule.limit} requêtes / ${rule.window} secondes`
        });
      }
    }

    // OK → continuer
    next();

  } catch (err) {
    console.error("RateLimiter error:", err);
    return res.status(500).json({ message: "Erreur interne Rate Limit" });
  }
};
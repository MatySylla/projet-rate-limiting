import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "Token manquant" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token invalide" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token expiré" });

    req.user = user;
    next();
  });
}

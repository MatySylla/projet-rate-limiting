import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ⚠️ CORRECTION : Déclarer la variable users et idCounter
let users = [];
let idCounter = 1;

export const register = async (req, res) => {
  try {
    console.log("🎯 REGISTER CALLED - Data:", req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email et mot de passe requis",
        received: req.body 
      });
    }
    
    // Vérifier si l'utilisateur existe
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "Utilisateur existe déjà" });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const user = {
      id: idCounter++,
      email,
      password: hashedPassword
    };
    
    users.push(user);
    console.log("✅ User created:", user.email);
    
    // Générer token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "24h" }
    );
    
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: {
        id: user.id, 
        email: user.email 
      }
    });
    
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ⚠️ CORRECTION : Utiliser la variable users
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ message: "Email/mot de passe incorrect" });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email/mot de passe incorrect" });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "24h" }
    );
    
    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id, 
        email: user.email 
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getProfile = (req, res) => {
  res.json(req.user);
};

// Route temporaire pour voir les users (optionnel)
export const getUsers = (req, res) => {
  res.json(users);
};
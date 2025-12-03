import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { rateLimiter } from "../middleware/rateLimiter.js";


const router = Router();

router.post("/register", register,rateLimiter);
router.post("/login", login,rateLimiter);
router.get("/me/token", authMiddleware,rateLimiter);

export default router;

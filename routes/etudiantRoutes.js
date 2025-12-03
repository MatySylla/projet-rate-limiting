import { Router } from "express";
import { getEtudiants, addEtudiant, updateEtudiant, deleteEtudiant } from "../controllers/etudiantController.js";

const router = Router();


router.get("/", getEtudiants);
router.post("/", addEtudiant);
router.put("/:id", updateEtudiant);
router.delete("/:id", deleteEtudiant);

export default router;

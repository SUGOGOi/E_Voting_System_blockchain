import express from "express";
import { checkConflict } from "../controllers/conflictController.js";

const router = express.Router();

router.post("/conflict_check", checkConflict);

export default router;
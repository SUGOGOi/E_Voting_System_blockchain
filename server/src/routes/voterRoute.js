import express from "express";

import { voterValidation } from "../controllers/voterController.js";
import passport from "passport"

const router = express.Router();

router.post('/voter-validation', voterValidation)

export default router;
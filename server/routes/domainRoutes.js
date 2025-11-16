import express from "express";
import { verifyEmailDomain } from "../controllers/domainController.js";

const router = express.Router();

router.post("/verify", verifyEmailDomain);

export default router;

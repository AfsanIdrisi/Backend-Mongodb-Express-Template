// root/src/routes/auth.route.ts

import { Router } from "express";
import { googleLogin, googleRegister, login,logout,refreshToken,register } from "../controllers/auth.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login",login);
router.post("/register",register)
router.post("/refresh",refreshToken)
router.post("/logout",verifyAccessToken,logout)
router.post("/google/register",googleRegister);
router.post("/google/login",googleLogin);

export default router
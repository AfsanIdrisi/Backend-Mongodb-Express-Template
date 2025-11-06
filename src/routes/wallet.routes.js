import { Router } from "express";
import { isAdmin, verifyAccessToken } from "../middlewares/auth.middleware.js";
import { createWallet, 
    decrementWalletByUserId, 
    getAllWallet, 
    getWalletByID,
    getWalletByUserId,
    incrementWalletByUserId, } from "../controllers/wallet.controller.js"
const router = Router();

router.post("/create", verifyAccessToken, createWallet);
router.get("/getAllWallet", verifyAccessToken, getAllWallet);
router.get("/getWalletByID/:id", verifyAccessToken, getWalletByID);
router.get("/getWalletByUserId", verifyAccessToken, getWalletByUserId);
router.put("/increment", verifyAccessToken, incrementWalletByUserId);
router.put("/decrement", verifyAccessToken, decrementWalletByUserId);


export default router
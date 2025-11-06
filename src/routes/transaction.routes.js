import { Router } from "express";
import { isAdmin, verifyAccessToken } from "../middlewares/auth.middleware.js";
import { createTransaction, 
    updateTransaction, 
    getAllTransaction, 
    getTransactionByID, 
    getTransactionByUserID, 
    getTransactionByPaymentID, 
    getTransactionByMethod, 
    getTransactionByMembership, 
    deleteTransaction} from "../controllers/transaction.controller.js"
const router = Router();

router.post("/create", verifyAccessToken, isAdmin, createTransaction);
router.put("/update", verifyAccessToken, isAdmin, updateTransaction);
router.get("/getAllTransaction", verifyAccessToken, isAdmin, getAllTransaction);
router.get("/getTransactionByID/:id", verifyAccessToken, isAdmin, getTransactionByID);
router.get("/getTransactionByUserID/:userId", verifyAccessToken, isAdmin, getTransactionByUserID);
router.get("/getTransactionByMembership/:membership", verifyAccessToken, isAdmin, getTransactionByMembership);
router.get("/getTransactionByPaymentID/:paymentId", verifyAccessToken, isAdmin, getTransactionByPaymentID);
router.get("/getTransactionByMethod/:method", verifyAccessToken,isAdmin, getTransactionByMethod);
router.delete("/delete/:id", verifyAccessToken, isAdmin, deleteTransaction);



export default router;
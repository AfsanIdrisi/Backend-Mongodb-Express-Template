import { Router } from "express";
import { createOrder, createSubscription, resumeAutopay, verifySubscription, webhook } from "../controllers/razorpay.controller.js";
import express from "express";
const router = Router();

router.post("/resume-autopay",resumeAutopay);
router.post("/create-order",createOrder);
router.post('/create-subscription',createSubscription );
router.post('/razorpay-webhook', express.json({ type: '*/*' }),webhook);
router.post('/verify-subscription', verifySubscription);

export default router
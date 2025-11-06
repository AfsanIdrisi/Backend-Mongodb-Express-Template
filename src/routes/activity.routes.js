import { Router } from "express";
import {
    createActivity,
    getAllActivity,
    getActivityByUserId,
    getActivityByName,
    updateActivity,
    deleteActivity,
    getNActivity
} from "../controllers/activity.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyAccessToken, createActivity);
router.get("/", verifyAccessToken, getAllActivity);
router.get("/:count",verifyAccessToken,getNActivity)
router.get("/user/:userId", verifyAccessToken, getActivityByUserId);
router.get("/name/:name", verifyAccessToken, getActivityByName);
router.put("/:id", verifyAccessToken, updateActivity);
router.delete("/:id", verifyAccessToken, deleteActivity);

export default router;
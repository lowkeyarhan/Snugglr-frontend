import express from "express";
import {
  updateProfile,
  updateSettings,
  getPotentialMatches,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/profile", authMiddleware, updateProfile);
router.put("/settings", authMiddleware, updateSettings);
router.get("/potential-matches", authMiddleware, getPotentialMatches);
router.get("/community/:community", authMiddleware, async (req, res) => {
  try {
    const { community } = req.params;
    const users = await (await import("../models/User.js")).default
      .find({ community })
      .select("-password");
    res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error(`Error fetching users by community: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching users by community",
      error: error.message,
    });
  }
});

export default router;

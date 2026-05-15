import express from "express";
import { body } from "express-validator";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["client", "freelancer", "admin"])
      .withMessage("Role must be client, freelancer, or admin"),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginUser
);

router.get("/me", protect, getCurrentUser);
router.post("/logout", logoutUser);

export default router;

import express from "express";
import { 
  googleSignIn,
  googleSignUp,
  registerCompanyAdmin, 
  registerEmployee, 
  loginUser, 
  getMe 
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../configs/cloudinary.js";

const router = express.Router();

// Google OAuth routes
router.post("/google-signin", googleSignIn);
router.post("/google-signup", googleSignUp);

// Traditional auth routes
router.post("/register-admin", registerCompanyAdmin);
router.post("/register-employee", registerEmployee);
router.post("/login", loginUser);

// Protected routes
router.get("/me", protect, getMe);

// Public upload endpoint for profile photo during registration
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ url: req.file.path });
});

export default router;

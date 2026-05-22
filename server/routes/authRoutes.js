import express from "express";
import { 
  googleSignIn,
  googleSignUp,
  registerCompanyAdmin, 
  registerEmployee, 
  loginUser, 
  getMe,
  updateProfile,
  updatePassword
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
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

// Public upload endpoint for profile photo during registration
router.post("/upload", protect, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ url: req.file.path });
});

export default router;

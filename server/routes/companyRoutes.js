import express from "express";
import {
  createCompany,
  verifyCompanyCode,
  getCompanyDetails,
  getCompanyEmployees,
  updateEmployeeStatus,
  updateCompanySettings,
} from "../controllers/companyController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/verify-code", verifyCompanyCode);

// Protected routes
router.use(protect);
router.post("/create", createCompany);
router.get("/details", getCompanyDetails);
router.get("/employees", getCompanyEmployees);
router.put("/employee-status", updateEmployeeStatus);
router.put("/settings", updateCompanySettings);

export default router;
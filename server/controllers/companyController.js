import Company from "../models/Company.js";
import User from "../models/User.js";
import crypto from "crypto";
import { sendEmployeeApprovalEmail } from "../utils/emailService.js";

// Create Company (Admin Registration)
export const createCompany = async (req, res) => {
  try {
    const { 
      companyName, 
      companyCode, 
      domain, 
      adminName, 
      adminEmail, 
      logo, 
      address, 
      phone, 
      website 
    } = req.body;

    // Validation
    if (!companyName || !companyCode || !domain || !adminName || !adminEmail) {
      return res.status(400).json({ 
        message: "Company name, code, domain, admin name and email are required" 
      });
    }

    // Check if company code already exists
    const existingCompanyCode = await Company.findOne({ 
      companyCode: companyCode.toUpperCase() 
    });
    if (existingCompanyCode) {
      return res.status(400).json({ 
        message: "Company code already exists" 
      });
    }

    // Check if domain already exists
    const existingDomain = await Company.findOne({ domain: domain.toLowerCase() });
    if (existingDomain) {
      return res.status(400).json({ 
        message: "Company domain already exists" 
      });
    }

    // Check if admin email already exists
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ 
        message: "Admin email already registered" 
      });
    }

    // Create admin user first
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      userType: "COMPANY_ADMIN",
      role: "ADMIN",
      isVerified: true,
      isApproved: true,
      image: logo || "",
    });

    // Create company
    const company = await Company.create({
      name: companyName,
      companyCode: companyCode.toUpperCase(),
      domain: domain.toLowerCase(),
      adminId: adminUser.id,
      logo: logo || "",
      address: address || "",
      phone: phone || "",
      website: website || "",
    });

    // Update admin user with company info
    adminUser.companyId = company.id;
    adminUser.companyCode = company.companyCode;
    await adminUser.save();

    res.status(201).json({
      message: "Company created successfully",
      company: {
        id: company.id,
        name: company.name,
        companyCode: company.companyCode,
        domain: company.domain,
        logo: company.logo,
      },
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        userType: adminUser.userType,
      }
    });

  } catch (error) {
    console.error("Create company error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Verify Company Code (For Employee Registration)
export const verifyCompanyCode = async (req, res) => {
  try {
    const { companyCode } = req.body;

    if (!companyCode) {
      return res.status(400).json({ message: "Company code is required" });
    }

    const company = await Company.findOne({ 
      companyCode: companyCode.toUpperCase(),
      isActive: true,
      allowRegistration: true 
    });

    if (!company) {
      return res.status(404).json({ 
        message: "Invalid company code or registration not allowed" 
      });
    }

    // Check employee limit
    const currentEmployeeCount = await User.countDocuments({ 
      companyId: company.id,
      userType: "EMPLOYEE" 
    });

    if (currentEmployeeCount >= company.maxEmployees) {
      return res.status(400).json({ 
        message: "Company has reached maximum employee limit" 
      });
    }

    res.json({
      valid: true,
      company: {
        id: company.id,
        name: company.name,
        companyCode: company.companyCode,
        domain: company.domain,
        logo: company.logo,
      }
    });

  } catch (error) {
    console.error("Verify company code error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Company Details
export const getCompanyDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || !user.companyId) {
      return res.status(404).json({ message: "User not associated with any company" });
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get company statistics
    const totalEmployees = await User.countDocuments({ 
      companyId: company.id,
      userType: "EMPLOYEE" 
    });

    const pendingApprovals = await User.countDocuments({ 
      companyId: company.id,
      userType: "EMPLOYEE",
      isApproved: false 
    });

    res.json({
      company: {
        ...company.toObject(),
        totalEmployees,
        pendingApprovals,
      }
    });

  } catch (error) {
    console.error("Get company details error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Company Employees (For Admin)
export const getCompanyEmployees = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    // Check if user is company admin
    if (!user || user.userType !== "COMPANY_ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const employees = await User.find({ 
      companyId: user.companyId,
      userType: "EMPLOYEE" 
    }).select("-password").sort({ createdAt: -1 });

    res.json({ employees });

  } catch (error) {
    console.error("Get company employees error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Approve/Reject Employee
export const updateEmployeeStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { employeeId, isApproved, role } = req.body;

    const admin = await User.findById(userId);
    if (!admin || admin.userType !== "COMPANY_ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.companyId !== admin.companyId) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const company = await Company.findById(admin.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    employee.isApproved = isApproved;
    if (role && ["ADMIN", "MANAGER", "EMPLOYEE"].includes(role)) {
      employee.role = role;
    }
    await employee.save();

    // Send email notification
    try {
      await sendEmployeeApprovalEmail(employee, company, isApproved);
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: `Employee ${isApproved ? 'approved' : 'rejected'} successfully`,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        isApproved: employee.isApproved,
        role: employee.role,
      }
    });

  } catch (error) {
    console.error("Update employee status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update Company Settings
export const updateCompanySettings = async (req, res) => {
  try {
    const userId = req.userId;
    const { allowRegistration, maxEmployees } = req.body;

    const admin = await User.findById(userId);
    if (!admin || admin.userType !== "COMPANY_ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const company = await Company.findById(admin.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (typeof allowRegistration === 'boolean') {
      company.allowRegistration = allowRegistration;
    }
    if (maxEmployees && maxEmployees > 0) {
      company.maxEmployees = maxEmployees;
    }

    await company.save();

    res.json({
      message: "Company settings updated successfully",
      company: company.toObject()
    });

  } catch (error) {
    console.error("Update company settings error:", error);
    res.status(500).json({ message: error.message });
  }
};
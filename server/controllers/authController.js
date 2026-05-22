import User from "../models/User.js";
import Company from "../models/Company.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Google Sign In
export const googleSignIn = async (req, res) => {
  try {
    const { googleUser } = req.body;
    
    if (!googleUser || !googleUser.email) {
      return res.status(400).json({ message: "Invalid Google user data" });
    }

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { auth0Id: googleUser.sub }
      ]
    }).populate('companyId');

    if (!user) {
      return res.status(404).json({ 
        message: "Account not found. Please sign up first.",
        needsSignup: true 
      });
    }

    // Update Google info if not set
    if (!user.auth0Id) {
      user.auth0Id = googleUser.sub;
      user.image = user.image || googleUser.picture;
      user.lastLogin = new Date();
      await user.save();
    }

    // Check if employee needs approval
    if (user.userType === "EMPLOYEE" && !user.isApproved) {
      return res.status(403).json({ 
        message: "Account pending approval from company admin" 
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        userType: user.userType,
        role: user.role,
        companyId: user.companyId,
        companyCode: user.companyCode,
        department: user.department,
        position: user.position,
        isApproved: user.isApproved,
      },
      company: user.companyId ? {
        id: user.companyId._id,
        name: user.companyId.name,
        companyCode: user.companyId.companyCode,
        logo: user.companyId.logo,
      } : null,
      token: generateToken(user.id),
      message: "Signed in successfully"
    });

  } catch (error) {
    console.error("Google sign in error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Google Sign Up
export const googleSignUp = async (req, res) => {
  try {
    const { googleUser, userType, companyData, companyCode } = req.body;
    
    if (!googleUser || !googleUser.email) {
      return res.status(400).json({ message: "Invalid Google user data" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { auth0Id: googleUser.sub }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: "Account already exists. Please sign in." });
    }

    let user;
    let company = null;

    if (userType === "COMPANY_ADMIN") {
      // Create company admin
      if (!companyData) {
        return res.status(400).json({ message: "Company data required for admin signup" });
      }

      // Check if company code already exists
      const existingCompanyCode = await Company.findOne({ 
        companyCode: companyData.companyCode.toUpperCase() 
      });
      if (existingCompanyCode) {
        return res.status(400).json({ message: "Company code already exists" });
      }

      // Create admin user first
      user = await User.create({
        auth0Id: googleUser.sub,
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        image: googleUser.picture || "",
        userType: "COMPANY_ADMIN",
        role: "ADMIN",
        isVerified: true,
        isApproved: true,
      });

      // Create company
      company = await Company.create({
        name: companyData.companyName,
        companyCode: companyData.companyCode.toUpperCase(),
        domain: companyData.domain.toLowerCase(),
        adminId: user.id,
        logo: companyData.logo || "",
      });

      // Update user with company info
      user.companyId = company.id;
      user.companyCode = company.companyCode;
      await user.save();

    } else {
      // Create employee
      if (!companyCode) {
        return res.status(400).json({ message: "Company code required for employee signup" });
      }

      // Verify company code
      company = await Company.findOne({ 
        companyCode: companyCode.toUpperCase(),
        isActive: true,
        allowRegistration: true 
      });

      if (!company) {
        return res.status(400).json({ message: "Invalid company code or registration not allowed" });
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

      // Create employee user
      user = await User.create({
        auth0Id: googleUser.sub,
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        image: googleUser.picture || "",
        companyId: company.id,
        companyCode: company.companyCode,
        userType: "EMPLOYEE",
        role: "EMPLOYEE",
        isVerified: true,
        isApproved: false, // Needs admin approval
      });
    }

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        userType: user.userType,
        role: user.role,
        companyId: user.companyId,
        companyCode: user.companyCode,
        isApproved: user.isApproved,
      },
      company: company ? {
        id: company.id,
        name: company.name,
        companyCode: company.companyCode,
        logo: company.logo,
      } : null,
      token: generateToken(user.id),
      message: userType === "EMPLOYEE" 
        ? "Registration successful. Waiting for admin approval."
        : "Company and admin account created successfully!"
    });

  } catch (error) {
    console.error("Google sign up error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Register Company Admin
export const registerCompanyAdmin = async (req, res) => {
  try {
    const { 
      companyName, 
      companyCode, 
      domain, 
      adminName, 
      adminEmail, 
      password,
      logo 
    } = req.body;

    if (!companyName || !companyCode || !domain || !adminName || !adminEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if company code already exists
    const existingCompanyCode = await Company.findOne({ 
      companyCode: companyCode.toUpperCase() 
    });
    if (existingCompanyCode) {
      return res.status(400).json({ message: "Company code already exists" });
    }

    // Check if admin email already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
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
    });

    // Update admin user with company info
    adminUser.companyId = company.id;
    adminUser.companyCode = company.companyCode;
    await adminUser.save();

    res.status(201).json({
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        userType: adminUser.userType,
        companyId: adminUser.companyId,
        companyCode: adminUser.companyCode,
      },
      company: {
        id: company.id,
        name: company.name,
        companyCode: company.companyCode,
      },
      token: generateToken(adminUser.id),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Register Employee with Company Code
export const registerEmployee = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      companyCode, 
      department, 
      position,
      image 
    } = req.body;

    if (!name || !email || !password || !companyCode) {
      return res.status(400).json({ message: "Name, email, password and company code are required" });
    }

    // Verify company code
    const company = await Company.findOne({ 
      companyCode: companyCode.toUpperCase(),
      isActive: true,
      allowRegistration: true 
    });

    if (!company) {
      return res.status(400).json({ message: "Invalid company code or registration not allowed" });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create employee user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      companyId: company.id,
      companyCode: company.companyCode,
      department: department || "OTHER",
      position: position || "",
      userType: "EMPLOYEE",
      role: "EMPLOYEE",
      isVerified: true,
      isApproved: false, // Needs admin approval
      image: image || "",
    });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        companyId: user.companyId,
        companyCode: user.companyCode,
        isApproved: user.isApproved,
      },
      company: {
        id: company.id,
        name: company.name,
        companyCode: company.companyCode,
      },
      token: generateToken(user.id),
      message: "Registration successful. Waiting for admin approval."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('companyId');

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if employee is approved
      if (user.userType === "EMPLOYEE" && !user.isApproved) {
        return res.status(403).json({ 
          message: "Account pending approval from company admin" 
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          userType: user.userType,
          role: user.role,
          companyId: user.companyId,
          companyCode: user.companyCode,
          department: user.department,
          position: user.position,
          isApproved: user.isApproved,
        },
        company: user.companyId ? {
          id: user.companyId._id,
          name: user.companyId.name,
          companyCode: user.companyId.companyCode,
          logo: user.companyId.logo,
        } : null,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile (Me)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password").populate('companyId');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      user: {
        ...user.toObject(),
        company: user.companyId ? {
          id: user.companyId._id,
          name: user.companyId.name,
          companyCode: user.companyId.companyCode,
          logo: user.companyId.logo,
        } : null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, image, department, position, phone, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (image !== undefined) user.image = image;
    if (department) user.department = department;
    if (position !== undefined) user.position = position;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        userType: user.userType,
        role: user.role,
        companyId: user.companyId,
        companyCode: user.companyCode,
        department: user.department,
        position: user.position,
        phone: user.phone,
        bio: user.bio,
        isApproved: user.isApproved,
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update Password
export const updatePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a password (not OAuth only)
    if (!user.password) {
      return res.status(400).json({ message: "Password not set. Please use OAuth login." });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: error.message });
  }
};
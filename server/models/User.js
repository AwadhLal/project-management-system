import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    auth0Id: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when present
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Not required for Auth0 users
    },
    image: {
      type: String,
      default: "",
    },
    companyId: {
      type: String,
      ref: "Company",
      default: null,
    },
    companyCode: {
      type: String,
      default: null, // Company code used during registration
    },
    department: {
      type: String,
      enum: [
        "ENGINEERING",
        "DESIGN", 
        "MARKETING",
        "SALES",
        "HR",
        "FINANCE",
        "OPERATIONS",
        "MANAGEMENT",
        "OTHER"
      ],
      default: "OTHER",
    },
    position: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    userType: {
      type: String,
      enum: ["COMPANY_ADMIN", "EMPLOYEE", "FREELANCER"],
      default: "EMPLOYEE",
    },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "EMPLOYEE"],
      default: "EMPLOYEE",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false, // Company admin needs to approve new employees
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("id").get(function () {
  return this._id;
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

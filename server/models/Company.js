import mongoose from "mongoose";
import crypto from "crypto";

const companySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    companyCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 3,
      maxlength: 8,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    logo: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    adminId: {
      type: String,
      ref: "User",
      required: true,
    },
    subscription: {
      type: String,
      enum: ["FREE", "BASIC", "PREMIUM", "ENTERPRISE"],
      default: "FREE",
    },
    maxEmployees: {
      type: Number,
      default: 10, // Based on subscription
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    allowRegistration: {
      type: Boolean,
      default: true, // Company admin can enable/disable new registrations
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

companySchema.virtual("id").get(function () {
  return this._id;
});

const Company = mongoose.models.Company || mongoose.model("Company", companySchema);
export default Company;
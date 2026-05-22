import mongoose from "mongoose";
import crypto from "crypto";

const projectSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "PLANNING", "COMPLETED", "ON_HOLD", "CANCELLED"],
      default: "ACTIVE",
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    team_lead: {
      type: String,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: String,
      ref: "Workspace",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

projectSchema.virtual("id").get(function () {
  return this._id;
});

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
export default Project;

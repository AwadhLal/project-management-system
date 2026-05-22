import mongoose from "mongoose";
import crypto from "crypto";

const workspaceMemberSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: String,
      ref: "Workspace",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["ADMIN", "MEMBER"],
      default: "MEMBER",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate membership
workspaceMemberSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

workspaceMemberSchema.virtual("id").get(function () {
  return this._id;
});

const WorkspaceMember = mongoose.models.WorkspaceMember || mongoose.model("WorkspaceMember", workspaceMemberSchema);
export default WorkspaceMember;

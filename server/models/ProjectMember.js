import mongoose from "mongoose";
import crypto from "crypto";

const projectMemberSchema = new mongoose.Schema(
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
    projectId: {
      type: String,
      ref: "Project",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate membership
projectMemberSchema.index({ userId: 1, projectId: 1 }, { unique: true });

projectMemberSchema.virtual("id").get(function () {
  return this._id;
});

const ProjectMember = mongoose.models.ProjectMember || mongoose.model("ProjectMember", projectMemberSchema);
export default ProjectMember;

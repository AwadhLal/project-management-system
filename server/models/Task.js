import mongoose from "mongoose";
import crypto from "crypto";

const taskSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    projectId: {
      type: String,
      ref: "Project",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },
    type: {
      type: String,
      enum: ["TASK", "BUG", "FEATURE", "IMPROVEMENT", "OTHER"],
      default: "TASK",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    assigneeId: {
      type: String,
      ref: "User",
      required: true,
    },
    due_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

taskSchema.virtual("id").get(function () {
  return this._id;
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
export default Task;

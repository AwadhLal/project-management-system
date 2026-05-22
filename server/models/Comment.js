import mongoose from "mongoose";
import crypto from "crypto";

const commentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    taskId: {
      type: String,
      ref: "Task",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.virtual("id").get(function () {
  return this._id;
});

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
export default Comment;

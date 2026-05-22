import mongoose from "mongoose";
import crypto from "crypto";

const workspaceSchema = new mongoose.Schema(
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
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ownerId: {
      type: String,
      ref: "User",
      required: true,
    },
    image_url: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

workspaceSchema.virtual("id").get(function () {
  return this._id;
});

const Workspace = mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);
export default Workspace;

import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import User from "../models/User.js";

// Assign member to project
export const assignMemberToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role = "MEMBER" } = req.body;
    const requesterId = req.userId;

    // Verify project exists and requester has permission
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if requester is project owner or admin

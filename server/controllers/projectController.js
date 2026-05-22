import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Comment from "../models/Comment.js";

// Create Project
export const createProject = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      workspaceId,
      description,
      name,
      status,
      start_date,
      end_date,
      team_members,
      team_lead,
      progress,
      priority,
    } = req.body;

    // Check if workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user has admin role for workspace
    const workspaceMembers = await WorkspaceMember.find({ workspaceId });
    const isWorkspaceAdmin = workspaceMembers.some(
      (member) => member.userId === userId && member.role === "ADMIN"
    );

    if (!isWorkspaceAdmin) {
      return res.status(403).json({
        message: "You don't have permission to create projects in this workspace",
      });
    }

    // Get Team Lead using email
    const teamLead = await User.findOne({ email: team_lead });
    if (!teamLead) {
      return res.status(404).json({ message: "Team lead user not found" });
    }

    const project = await Project.create({
      workspaceId,
      name,
      description: description || "",
      status: status || "ACTIVE",
      priority: priority || "MEDIUM",
      progress: progress || 0,
      team_lead: teamLead.id,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
    });

    // Add members to project if they are in the workspace
    if (team_members?.length > 0) {
      const workspaceUserIds = workspaceMembers.map((m) => m.userId);
      const matchedUsers = await User.find({
        email: { $in: team_members },
        _id: { $in: workspaceUserIds },
      });

      const projectMembersToAdd = matchedUsers.map((u) => ({
        projectId: project.id,
        userId: u.id,
      }));

      if (projectMembersToAdd.length > 0) {
        await ProjectMember.insertMany(projectMembersToAdd);
      }
    }

    // Fetch full project details with populated members & tasks to return to frontend
    const owner = await User.findById(project.team_lead).select("-password").lean();
    const pmDocs = await ProjectMember.find({ projectId: project.id }).lean();
    
    const members = [];
    for (const pm of pmDocs) {
      const pmUser = await User.findById(pm.userId).select("-password").lean();
      if (pmUser) {
        members.push({
          ...pm,
          user: pmUser,
          id: pm._id,
        });
      }
    }

    const projectWithMembers = {
      ...project.toObject(),
      id: project.id,
      owner,
      members,
      tasks: [],
    };

    // Emit Socket.io event for project creation
    if (req.io) {
      req.io.to(workspaceId).emit("project_created", projectWithMembers);
    }

    res.json({
      project: projectWithMembers,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Update Project
export const updateProject = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      id,
      workspaceId,
      description,
      name,
      status,
      start_date,
      end_date,
      progress,
      priority,
    } = req.body;

    const workspaceMembers = await WorkspaceMember.find({ workspaceId });
    const isWorkspaceAdmin = workspaceMembers.some(
      (member) => member.userId === userId && member.role === "ADMIN"
    );

    if (!isWorkspaceAdmin) {
      const currentProject = await Project.findById(id);
      if (!currentProject) {
        return res.status(404).json({ message: "Project not found" });
      } else if (currentProject.team_lead !== userId) {
        return res.status(403).json({
          message: "You don't have permission to update projects in this workspace",
        });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        workspaceId,
        description,
        name,
        status,
        priority,
        progress,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const owner = await User.findById(updatedProject.team_lead).select("-password").lean();
    const pmDocs = await ProjectMember.find({ projectId: updatedProject.id }).lean();
    const members = [];
    for (const pm of pmDocs) {
      const pmUser = await User.findById(pm.userId).select("-password").lean();
      if (pmUser) {
        members.push({ ...pm, user: pmUser, id: pm._id });
      }
    }

    const taskDocs = await Task.find({ projectId: updatedProject.id }).lean();
    const tasks = [];
    for (const taskDoc of taskDocs) {
      const assignee = await User.findById(taskDoc.assigneeId).select("-password").lean();
      const commentDocs = await Comment.find({ taskId: taskDoc._id }).lean();
      const comments = [];
      for (const commentDoc of commentDocs) {
        const cUser = await User.findById(commentDoc.userId).select("-password").lean();
        if (cUser) {
          comments.push({ ...commentDoc, user: cUser, id: commentDoc._id });
        }
      }
      tasks.push({ ...taskDoc, id: taskDoc._id, assignee, comments });
    }

    const formattedProject = {
      ...updatedProject.toObject(),
      id: updatedProject.id,
      owner,
      members,
      tasks,
    };

    // Emit Socket.io event for project update
    if (req.io) {
      req.io.to(workspaceId).emit("project_updated", formattedProject);
    }

    res.json({ project: formattedProject, message: "Project updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Add Member to Project
export const addMember = async (req, res) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;
    const { email } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "Only project lead can add members" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({ userId: user.id, projectId });
    if (existingMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    // Ensure member is in the workspace
    const workspaceMember = await WorkspaceMember.findOne({
      userId: user.id,
      workspaceId: project.workspaceId,
    });
    if (!workspaceMember) {
      return res.status(400).json({ message: "User must be a member of the workspace first" });
    }

    const member = await ProjectMember.create({
      userId: user.id,
      projectId,
    });

    const formattedMember = {
      ...member.toObject(),
      id: member.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    };

    // Emit Socket.io event for member added
    if (req.io) {
      req.io.to(projectId).emit("member_added", formattedMember);
    }

    res.json({ member: formattedMember, message: "Member added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

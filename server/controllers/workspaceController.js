import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import Task from "../models/Task.js";
import Comment from "../models/Comment.js";

// Helper to generate slug from name
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
};

// Create a new Workspace
export const createWorkspace = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description, image_url } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    let slug = slugify(name);
    // Ensure slug is unique
    const existingSlug = await Workspace.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const workspace = await Workspace.create({
      name,
      description: description || "",
      slug,
      ownerId: userId,
      image_url: image_url || "",
    });

    // Automatically add creator as ADMIN member
    await WorkspaceMember.create({
      userId,
      workspaceId: workspace.id,
      role: "ADMIN",
    });

    // Fetch and format the newly created workspace to match frontend structure
    const owner = await User.findById(userId).select("-password").lean();
    const formattedWorkspace = {
      ...workspace.toObject(),
      id: workspace.id,
      owner,
      members: [
        {
          userId,
          workspaceId: workspace.id,
          role: "ADMIN",
          user: owner,
        },
      ],
      projects: [],
    };

    res.status(201).json({
      workspace: formattedWorkspace,
      message: "Workspace created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all workspaces for user
export const getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.userId;
    const memberRelations = await WorkspaceMember.find({ userId }).select("workspaceId");
    const workspaceIds = memberRelations.map((m) => m.workspaceId);

    const workspaces = [];
    for (const id of workspaceIds) {
      const workspace = await Workspace.findById(id).lean();
      if (!workspace) continue;

      // Owner
      const owner = await User.findById(workspace.ownerId).select("-password").lean();

      // Members
      const memberDocs = await WorkspaceMember.find({ workspaceId: id }).lean();
      const members = [];
      for (const memberDoc of memberDocs) {
        const memberUser = await User.findById(memberDoc.userId).select("-password").lean();
        if (memberUser) {
          members.push({
            ...memberDoc,
            user: memberUser,
            id: memberDoc._id,
          });
        }
      }

      // Projects
      const projectDocs = await Project.find({ workspaceId: id }).lean();
      const projects = [];
      for (const projectDoc of projectDocs) {
        const pOwner = await User.findById(projectDoc.team_lead).select("-password").lean();

        // Project Members
        const pMemberDocs = await ProjectMember.find({ projectId: projectDoc._id }).lean();
        const pMembers = [];
        for (const pm of pMemberDocs) {
          const pmUser = await User.findById(pm.userId).select("-password").lean();
          if (pmUser) {
            pMembers.push({
              ...pm,
              user: pmUser,
              id: pm._id,
            });
          }
        }

        // Tasks
        const taskDocs = await Task.find({ projectId: projectDoc._id }).lean();
        const tasks = [];
        for (const taskDoc of taskDocs) {
          const assignee = await User.findById(taskDoc.assigneeId).select("-password").lean();

          // Comments
          const commentDocs = await Comment.find({ taskId: taskDoc._id }).lean();
          const comments = [];
          for (const commentDoc of commentDocs) {
            const cUser = await User.findById(commentDoc.userId).select("-password").lean();
            if (cUser) {
              comments.push({
                ...commentDoc,
                user: cUser,
                id: commentDoc._id,
              });
            }
          }

          tasks.push({
            ...taskDoc,
            id: taskDoc._id,
            assignee,
            comments,
          });
        }

        projects.push({
          ...projectDoc,
          id: projectDoc._id,
          owner: pOwner,
          members: pMembers,
          tasks,
        });
      }

      workspaces.push({
        ...workspace,
        id: workspace._id,
        owner,
        members,
        projects,
      });
    }

    res.json({ workspaces });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Add member to workspace
export const addMember = async (req, res) => {
  try {
    const userId = req.userId;
    const { email, role, workspaceId, message } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if no missing parameters
    if (!workspaceId || !role) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Check if role is valid
    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Fetch workspace
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Fetch members to verify authorization
    const workspaceMembers = await WorkspaceMember.find({ workspaceId });

    // Check creator has admin role
    const requestingUserMember = workspaceMembers.find(
      (m) => m.userId === userId && m.role === "ADMIN"
    );

    if (!requestingUserMember) {
      return res
        .status(401)
        .json({ message: "You do not have admin privileges" });
    }

    // Check if user is already a member
    const existingMember = workspaceMembers.find(
      (m) => m.userId === user.id
    );

    if (existingMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    const member = await WorkspaceMember.create({
      userId: user.id,
      workspaceId,
      role,
      message: message || "",
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

    return res.json({ member: formattedMember, message: "Member added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

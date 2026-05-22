import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import User from "../models/User.js";

// Add comment
export const addComment = async (req, res) => {
  try {
    const userId = req.userId;
    const { content, taskId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is lead or a member of project
    const isLead = project.team_lead === userId;
    const isMember = await ProjectMember.findOne({ userId, projectId: project.id });

    if (!isLead && !isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this project" });
    }

    const comment = await Comment.create({
      taskId,
      content,
      userId,
    });

    const user = await User.findById(userId).select("-password").lean();
    const formattedComment = {
      ...comment.toObject(),
      id: comment.id,
      user,
    };

    // Emit Socket.io event for new comment
    if (req.io) {
      req.io.to(task.projectId).emit("comment_added", formattedComment);
    }

    res.json({ comment: formattedComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get comments for task
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const commentsList = await Comment.find({ taskId }).lean();

    const comments = [];
    for (const item of commentsList) {
      const user = await User.findById(item.userId).select("-password").lean();
      comments.push({
        ...item,
        id: item._id,
        user,
      });
    }

    res.json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

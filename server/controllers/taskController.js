import Task from "../models/Task.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import User from "../models/User.js";
import sendEmail from "../configs/nodemailer.js";

// Create task
export const createTask = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      projectId,
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      due_date,
    } = req.body;
    const origin = req.get("origin") || "http://localhost:5173";

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have admin privileges for this project" });
    }

    // Verify if assignee is a member of the project
    if (assigneeId) {
      const isMember = await ProjectMember.findOne({ userId: assigneeId, projectId });
      const isLead = project.team_lead === assigneeId;
      if (!isMember && !isLead) {
        return res.status(403).json({
          message: "Assignee is not a member of the project",
        });
      }
    }

    const task = await Task.create({
      projectId,
      title,
      description: description || "",
      priority: priority || "MEDIUM",
      assigneeId,
      status: status || "TODO",
      type: type || "TASK",
      due_date: new Date(due_date),
    });

    const assignee = await User.findById(assigneeId).select("-password").lean();
    const taskWithAssignee = {
      ...task.toObject(),
      id: task.id,
      assignee,
      comments: [],
    };

    // Socket.io Real-time Emission
    if (req.io) {
      req.io.to(projectId).emit("task_created", taskWithAssignee);
    }

    // Direct Email Notification using Nodemailer
    if (assignee?.email) {
      try {
        await sendEmail({
          to: assignee.email,
          subject: `New Task Assignment in ${project.name}`,
          body: `<div style="max-width: 600px; font-family: sans-serif;">
            <h2>Hi ${assignee.name}, 👋</h2>
            <p style="font-size: 16px;">You've been assigned a new task:</p>
            <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${title}</p>
            <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
              <p style="margin: 6px 0;"><strong>Description:</strong> ${description || "No description provided."}</p>
              <p style="margin: 6px 0;"><strong>Due Date:</strong> ${new Date(due_date).toLocaleDateString()}</p>
            </div>
            <a href="${origin}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none; display: inline-block;">
              View Dashboard
            </a>
          </div>`,
        });
      } catch (err) {
        console.error("Email sending failed:", err.message);
      }
    }

    res.json({ task: taskWithAssignee, message: "Task created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userId = req.userId;

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update body check
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    const assignee = await User.findById(updatedTask.assigneeId).select("-password").lean();
    const taskWithAssignee = {
      ...updatedTask.toObject(),
      id: updatedTask.id,
      assignee,
    };

    // Socket.io Real-time Emission
    if (req.io) {
      req.io.to(task.projectId).emit("task_updated", taskWithAssignee);
    }

    res.json({ task: taskWithAssignee, message: "Task updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { tasksIds } = req.body; // Array of IDs

    if (!tasksIds || tasksIds.length === 0) {
      return res.status(400).json({ message: "Task IDs are required" });
    }

    const tasks = await Task.find({ _id: { $in: tasksIds } });
    if (tasks.length === 0) {
      return res.status(404).json({ message: "Tasks not found" });
    }

    const project = await Project.findById(tasks[0].projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have admin privileges for this project" });
    }

    await Task.deleteMany({ _id: { $in: tasksIds } });

    // Socket.io Real-time Emission
    if (req.io) {
      req.io.to(tasks[0].projectId).emit("tasks_deleted", { tasksIds, projectId: tasks[0].projectId });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

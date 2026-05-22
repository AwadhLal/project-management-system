import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadTheme } from "../features/themeSlice";
import { Loader2Icon } from "lucide-react";
import { useUser, useAuth } from "../context/AuthContext";
import {
  fetchWorkspaces,
  addWorkspace,
  setCurrentWorkspace,
  addProject,
  addTask,
  updateTask,
  deleteTask,
} from "../features/workspaceSlice";
import api from "../configs/api";
import toast from "react-hot-toast";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loading, workspaces } = useSelector((state) => state.workspace);
  const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace);
  const dispatch = useDispatch();

  const { user, isLoaded, socket } = useUser();
  const { getToken } = useAuth();

  // Custom Workspace Creation State
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Initial load of theme
  useEffect(() => {
    dispatch(loadTheme());
  }, []);

  // Initial load of workspaces
  useEffect(() => {
    if (isLoaded && user && workspaces.length === 0) {
      dispatch(fetchWorkspaces({ getToken }));
    }
  }, [user, isLoaded]);

  // Real-time WebSockets integration via Socket.io
  useEffect(() => {
    if (!socket || !currentWorkspace) return;

    // Join workspace and project rooms
    socket.emit("join_workspace", currentWorkspace.id);
    if (currentWorkspace.projects) {
      currentWorkspace.projects.forEach((proj) => {
        socket.emit("join_project", proj.id);
      });
    }

    // Socket listeners for real-time state synchronization
    socket.on("project_created", (newProject) => {
      dispatch(addProject(newProject));
      toast.success(`Project "${newProject.name}" created!`);
    });

    socket.on("project_updated", (updatedProject) => {
      // Re-fetch workspaces to refresh all lists on updates
      dispatch(fetchWorkspaces({ getToken }));
    });

    socket.on("task_created", (newTask) => {
      dispatch(addTask(newTask));
      toast.success(`New task "${newTask.title}" assigned!`);
    });

    socket.on("task_updated", (updatedTask) => {
      dispatch(updateTask(updatedTask));
    });

    socket.on("tasks_deleted", ({ tasksIds }) => {
      dispatch(deleteTask(tasksIds));
      toast.error("Task(s) deleted");
    });

    return () => {
      socket.off("project_created");
      socket.off("project_updated");
      socket.off("task_created");
      socket.off("task_updated");
      socket.off("tasks_deleted");
    };
  }, [socket, currentWorkspace, dispatch]);

  const handleCreateWorkspaceSubmit = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    try {
      setCreateLoading(true);
      const token = await getToken();
      const { data } = await api.post(
        "/api/workspaces",
        { name: newWorkspaceName, description: newWorkspaceDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(addWorkspace(data.workspace));
      dispatch(setCurrentWorkspace(data.workspace.id));
      toast.success(data.message || "Workspace created successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create workspace");
    } finally {
      setCreateLoading(false);
    }
  };

  // If auth is loaded but no user, redirect to login
  if (isLoaded && !user) {
    return <Navigate to="/login" replace />;
  }

  // Show loading spinner
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
        <Loader2Icon className="size-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  // If user exists but has no workspaces, render premium workspace setup
  if (user && workspaces.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-zinc-950 px-4">
        {/* Decorative background blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
        
        <div className="relative w-full max-w-md p-8 md:p-10 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border border-white/40 dark:border-zinc-800/40 shadow-2xl transition">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Create Your First Workspace
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Workspaces isolate your team's projects and tasks
            </p>
          </div>

          <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Workspace Name
              </label>
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm"
                placeholder="My Organization"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newWorkspaceDesc}
                onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                rows="3"
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm resize-none"
                placeholder="Briefly describe what this workspace is for"
              />
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {createLoading ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                "Create Workspace"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col h-screen">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

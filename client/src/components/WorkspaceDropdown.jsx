import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace, addWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../configs/api";
import toast from "react-hot-toast";

function WorkspaceDropdown() {
  const { workspaces } = useSelector((state) => state.workspace);
  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null
  );
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const onSelectWorkspace = (workspaceId) => {
    dispatch(setCurrentWorkspace(workspaceId));
    setIsOpen(false);
    navigate("/");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    try {
      setCreateLoading(true);
      const token = await getToken();
      const { data } = await api.post(
        "/api/workspaces",
        { name: newName, description: newDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(addWorkspace(data.workspace));
      dispatch(setCurrentWorkspace(data.workspace.id));
      setIsCreateModalOpen(false);
      setNewName("");
      setNewDesc("");
      toast.success(data.message || "Workspace created successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create workspace");
    } finally {
      setCreateLoading(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative m-4" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <img
            src={currentWorkspace?.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentWorkspace?.name}`}
            alt={currentWorkspace?.name}
            className="w-8 h-8 rounded shadow object-cover"
            onError={(e) => {
              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${currentWorkspace?.name}`;
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
              {currentWorkspace?.name || "Select Workspace"}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
              {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0">
          <div className="p-2">
            <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
              Workspaces
            </p>
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <img
                  src={ws.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${ws.name}`}
                  alt={ws.name}
                  className="w-6 h-6 rounded object-cover"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${ws.name}`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {ws.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                    {ws.members?.length || 0} members
                  </p>
                </div>
                {currentWorkspace?.id === ws.id && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          <hr className="border-gray-200 dark:border-zinc-700" />

          <div
            onClick={() => {
              setIsCreateModalOpen(true);
              setIsOpen(false);
            }}
            className="p-2 cursor-pointer rounded group hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <p className="flex items-center text-xs gap-2 my-1 w-full text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 font-medium">
              <Plus className="w-4 h-4" /> Create Workspace
            </p>
          </div>
        </div>
      )}

      {/* Custom Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-55">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200 shadow-2xl relative">
            <h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white">Create New Workspace</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded focus:outline-none focus:border-blue-500 text-sm text-zinc-900 dark:text-white bg-white/50"
                  required
                  placeholder="My Workspace"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded focus:outline-none focus:border-blue-500 text-sm text-zinc-900 dark:text-white bg-white/50"
                  rows="3"
                  placeholder="Describe this workspace"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1 transition cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  {createLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceDropdown;

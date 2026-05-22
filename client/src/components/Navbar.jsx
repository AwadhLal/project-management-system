import { useState, useRef, useEffect } from "react";
import { SearchIcon, PanelLeft, LogOut, User as UserIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/themeSlice";
import { MoonIcon, SunIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Left section */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Sidebar Trigger */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <PanelLeft size={20} />
          </button>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="pl-8 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            {theme === "light" ? (
              <MoonIcon className="size-4 text-gray-800 dark:text-gray-200" />
            ) : (
              <SunIcon className="size-4 text-yellow-400" />
            )}
          </button>

          {/* User Button */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-800 overflow-hidden cursor-pointer focus:outline-none flex items-center justify-center bg-zinc-100 dark:bg-zinc-800"
              >
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-2 z-55 backdrop-blur-xl bg-white/95 dark:bg-zinc-900/95">
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-zinc-800">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

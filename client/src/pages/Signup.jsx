import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../configs/api";
import { Loader2, Camera } from "lucide-react";
import toast from "react-hot-toast";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const { register, loading } = useAuth();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setError("");
      const { data } = await api.post("/api/auth/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatar(data.url);
      toast.success("Profile photo uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      await register(name, email, password, avatar);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-zinc-950 px-4 py-12">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Auth Card */}
      <div className="relative w-full max-w-md p-8 md:p-10 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border border-white/40 dark:border-zinc-800/40 shadow-2xl transition duration-300">
        <div className="text-center mb-8">
          <h1 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Project Management System</h1>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400">
            Sign up to start organizing your workspaces
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm rounded-lg bg-red-500/10 text-red-500 border border-red-500/25">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center relative">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-zinc-400" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow cursor-pointer hover:bg-blue-700 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Camera className="w-3.5 h-3.5" />
              </label>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Profile Photo (Optional)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

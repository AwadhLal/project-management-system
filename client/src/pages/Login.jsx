import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

const Login = () => {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      // Error handling is done in AuthContext
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-zinc-950 px-4">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Auth Card */}
      <div className="relative w-full max-w-md p-8 md:p-10 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border border-white/40 dark:border-zinc-800/40 shadow-2xl transition duration-300">
        <div className="text-center mb-8">
          <h1 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Project Management System</h1>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Sign in to Project-Management
          </h2>
          <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400">
            Welcome back! Please sign in to continue
          </p>
        </div>

        <div className="space-y-6">
          {/* Google Sign In */}
          <GoogleAuthButton type="signin" />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/70 dark:bg-zinc-900/70 text-zinc-500">
                or
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>
        </div>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/70 dark:bg-zinc-900/70 text-zinc-500">
                Don't have an account?
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/company-signup"
              className="w-full flex items-center justify-center px-4 py-3 border border-blue-300 dark:border-blue-600 rounded-lg text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
            >
              Register Company
            </Link>
            <Link
              to="/employee-signup"
              className="w-full flex items-center justify-center px-4 py-3 border border-green-300 dark:border-green-600 rounded-lg text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-900/20 hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
            >
              Join as Employee
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

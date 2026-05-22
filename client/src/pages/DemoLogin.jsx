import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Play, User, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getDemoCredentials } from "../utils/authMode";
import toast from "react-hot-toast";

const DemoLogin = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const demoCredentials = getDemoCredentials();

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

  const handleDemoLogin = async (type) => {
    const credentials = type === 'admin' ? demoCredentials.admin : demoCredentials.employee;
    
    setFormData({
      email: credentials.email,
      password: credentials.password
    });

    try {
      await login(credentials.email, credentials.password);
      toast.success(`Logged in as demo ${type}`);
    } catch (error) {
      toast.error(`Demo ${type} login failed. Please register first.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-8">
        {/* Demo Mode Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Demo Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Try the system without external authentication
          </p>
          <div className="mt-3 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full text-xs text-orange-800 dark:text-orange-200 inline-block">
            No Google/Auth0 required
          </div>
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
            Quick Demo Access
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="flex flex-col items-center p-3 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
            >
              <Building2 className="w-6 h-6 text-blue-600 mb-1" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Demo Admin
              </span>
              <span className="text-xs text-gray-500">
                Company Owner
              </span>
            </button>
            
            <button
              onClick={() => handleDemoLogin('employee')}
              disabled={loading}
              className="flex flex-col items-center p-3 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
            >
              <User className="w-6 h-6 text-green-600 mb-1" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                Demo Employee
              </span>
              <span className="text-xs text-gray-500">
                Team Member
              </span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-zinc-900 text-gray-500">
              Or login manually
            </span>
          </div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="Enter your password"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Demo Credentials Info */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Demo Credentials:
          </h4>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <strong>Admin:</strong> admin@demo.com / demo123
            </div>
            <div>
              <strong>Employee:</strong> employee@demo.com / demo123
            </div>
            <div>
              <strong>Company Code:</strong> DEMO123
            </div>
          </div>
        </div>

        {/* Registration Options */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-zinc-900 text-gray-500">
                Create demo account
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/demo-company-signup"
              className="w-full flex items-center justify-center px-4 py-3 border border-orange-300 dark:border-orange-600 rounded-lg text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-sm font-medium"
            >
              Register Demo Company
            </Link>
            <Link
              to="/demo-employee-signup"
              className="w-full flex items-center justify-center px-4 py-3 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
            >
              Join as Demo Employee
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;
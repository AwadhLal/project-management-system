import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Hash, Building2, Briefcase, Users } from "lucide-react";
import toast from "react-hot-toast";
import api from "../configs/api";

const EmployeeSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [companyVerified, setCompanyVerified] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    companyCode: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "OTHER",
    position: "",
    image: "",
  });

  const departments = [
    { value: "ENGINEERING", label: "Engineering" },
    { value: "DESIGN", label: "Design" },
    { value: "MARKETING", label: "Marketing" },
    { value: "SALES", label: "Sales" },
    { value: "HR", label: "Human Resources" },
    { value: "FINANCE", label: "Finance" },
    { value: "OPERATIONS", label: "Operations" },
    { value: "MANAGEMENT", label: "Management" },
    { value: "OTHER", label: "Other" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const verifyCompanyCode = async () => {
    if (!formData.companyCode) {
      toast.error("Please enter company code");
      return;
    }

    setVerifyingCode(true);
    try {
      const { data } = await api.post("/api/company/verify-code", {
        companyCode: formData.companyCode
      });

      if (data.valid) {
        setCompanyVerified(true);
        setCompanyInfo(data.company);
        toast.success(`Company verified: ${data.company.name}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid company code");
      setCompanyVerified(false);
      setCompanyInfo(null);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!companyVerified) {
      toast.error("Please verify company code first");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/register-employee", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyCode: formData.companyCode,
        department: formData.department,
        position: formData.position,
        image: formData.image,
      });

      localStorage.setItem("token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      
      toast.success(data.message || "Registration successful!");
      navigate("/");
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Join Your Company
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter your company code to get started
          </p>
        </div>

        {/* Company Code Verification */}
        {!companyVerified && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="companyCode"
                  value={formData.companyCode}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white uppercase"
                  placeholder="Enter company code"
                  required
                />
              </div>
              <button
                type="button"
                onClick={verifyCompanyCode}
                disabled={verifyingCode || !formData.companyCode}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingCode ? "..." : "Verify"}
              </button>
            </div>
          </div>
        )}

        {/* Company Info Display */}
        {companyVerified && companyInfo && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  {companyInfo.name}
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Code: {companyInfo.companyCode}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        {companyVerified && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="your.email@company.com"
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                required
              >
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position/Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., Software Developer, Designer"
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
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? "Joining Company..." : "Join Company"}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-600 hover:text-green-500 font-medium"
            >
              Sign in
            </Link>
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Want to register a company?{" "}
            <Link
              to="/company-signup"
              className="text-green-600 hover:text-green-500 font-medium"
            >
              Register Company
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSignup;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, Hash, Globe, User, Briefcase } from "lucide-react";
import GoogleAuthButton from "../components/GoogleAuthButton";
import api from "../configs/api";
import toast from "react-hot-toast";

const GoogleSignupFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Choose type, 2: Company details, 3: Employee details
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [companyData, setCompanyData] = useState({
    companyName: "",
    companyCode: "",
    domain: "",
    logo: "",
  });

  const [employeeData, setEmployeeData] = useState({
    companyCode: "",
    department: "OTHER",
    position: "",
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

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep(2);
  };

  const handleGoogleSignup = async (googleUserData) => {
    setLoading(true);
    
    try {
      const payload = {
        googleUser: googleUserData.googleUser,
        userType,
      };

      if (userType === "COMPANY_ADMIN") {
        payload.companyData = companyData;
      } else {
        payload.companyCode = employeeData.companyCode;
        payload.department = employeeData.department;
        payload.position = employeeData.position;
      }

      const { data } = await api.post("/api/auth/google-signup", payload);

      localStorage.setItem("token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      
      toast.success(data.message);
      navigate("/");
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyCompanyCode = async () => {
    if (!employeeData.companyCode) {
      toast.error("Please enter company code");
      return;
    }

    try {
      const { data } = await api.post("/api/company/verify-code", {
        companyCode: employeeData.companyCode
      });

      if (data.valid) {
        toast.success(`Company verified: ${data.company.name}`);
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid company code");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-8">
        
        {/* Step 1: Choose User Type */}
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Create your account
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome! Please fill in the details to get started.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleUserTypeSelect("COMPANY_ADMIN")}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Register Company
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Create a new company account
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUserTypeSelect("EMPLOYEE")}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Join as Employee
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Join an existing company
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Step 2: Company Details or Company Code */}
        {step === 2 && userType === "COMPANY_ADMIN" && (
          <>
            <div className="text-center mb-6">
              <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Setup your organization
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your organization details to continue
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="My Organization"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Code
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={companyData.companyCode}
                    onChange={(e) => setCompanyData({...companyData, companyCode: e.target.value.toUpperCase()})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white uppercase"
                    placeholder="COMP123"
                    maxLength={8}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domain
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={companyData.domain}
                    onChange={(e) => setCompanyData({...companyData, domain: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder="company.com"
                    required
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!companyData.companyName || !companyData.companyCode || !companyData.domain}
                className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && userType === "EMPLOYEE" && (
          <>
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Enter Company Code
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the code provided by your company
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={employeeData.companyCode}
                      onChange={(e) => setEmployeeData({...employeeData, companyCode: e.target.value.toUpperCase()})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white uppercase"
                      placeholder="Enter company code"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={verifyCompanyCode}
                    disabled={!employeeData.companyCode}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <select
                  value={employeeData.department}
                  onChange={(e) => setEmployeeData({...employeeData, department: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                >
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position/Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={employeeData.position}
                    onChange={(e) => setEmployeeData({...employeeData, position: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., Software Developer"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Google Authentication */}
        {step === 3 && (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Complete Registration
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in with Google to complete your account setup
              </p>
            </div>

            <GoogleAuthButton 
              type="signup" 
              onSuccess={handleGoogleSignup}
            />

            <div className="mt-4 text-center">
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Back
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        {step === 1 && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-purple-600 hover:text-purple-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleSignupFlow;
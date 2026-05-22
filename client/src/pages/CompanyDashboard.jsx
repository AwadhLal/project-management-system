import { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  UserPlus,
  Settings,
  BarChart3
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../configs/api";
import toast from "react-hot-toast";
import CompanyEmployees from "../components/CompanyEmployees";

const CompanyDashboard = () => {
  const { getToken, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [companyStats, setCompanyStats] = useState({
    totalEmployees: 0,
    approvedEmployees: 0,
    pendingEmployees: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanyData = async () => {
    try {
      const token = await getToken();
      
      const { data } = await api.get("/api/company/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const employees = data.employees || [];
      setCompanyStats({
        totalEmployees: employees.length,
        approvedEmployees: employees.filter(emp => emp.isApproved).length,
        pendingEmployees: employees.filter(emp => !emp.isApproved).length,
        totalProjects: 0, // Will be updated when projects API is integrated
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: "employee_joined",
          message: "New employee registration pending approval",
          time: "2 hours ago",
          icon: UserPlus,
          color: "text-blue-600"
        },
        {
          id: 2,
          type: "project_created",
          message: "New project 'Website Redesign' created",
          time: "1 day ago",
          icon: FolderOpen,
          color: "text-green-600"
        },
        {
          id: 3,
          type: "task_completed",
          message: "5 tasks completed this week",
          time: "2 days ago",
          icon: CheckCircle,
          color: "text-purple-600"
        }
      ]);

    } catch (error) {
      console.error("Fetch company data error:", error);
      toast.error("Failed to fetch company data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userType === "COMPANY_ADMIN") {
      fetchCompanyData();
    }
  }, [user]);

  if (user?.userType !== "COMPANY_ADMIN") {
    return (
      <div className="text-center py-8">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Access Denied
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Only company admins can access this dashboard
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Company Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your company, employees, and projects
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "employees", label: "Employees", icon: Users },
            { id: "projects", label: "Projects", icon: FolderOpen },
            { id: "analytics", label: "Analytics", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {companyStats.totalEmployees}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {companyStats.pendingEmployees}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Projects</p>
                  <p className="text-2xl font-bold text-green-600">
                    {companyStats.activeProjects}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  <FolderOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed Tasks</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {companyStats.completedTasks}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "employees" && <CompanyEmployees />}

      {activeTab === "projects" && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Projects Management
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Project management features will be integrated here
          </p>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Detailed analytics and reports coming soon
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
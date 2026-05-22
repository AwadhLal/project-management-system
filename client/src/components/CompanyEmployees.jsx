import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  User,
  Mail,
  Calendar,
  Building2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../configs/api";
import toast from "react-hot-toast";

const CompanyEmployees = () => {
  const { getToken, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, approved, pending

  const fetchEmployees = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/company/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(data.employees || []);
    } catch (error) {
      console.error("Fetch employees error:", error);
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userType === "COMPANY_ADMIN") {
      fetchEmployees();
    }
  }, [user]);

  const handleEmployeeAction = async (employeeId, isApproved, role = "EMPLOYEE") => {
    try {
      const token = await getToken();
      const { data } = await api.put(
        "/api/company/employee-status",
        {
          employeeId,
          isApproved,
          role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(data.message);
      fetchEmployees(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === "all" ||
      (filterStatus === "approved" && employee.isApproved) ||
      (filterStatus === "pending" && !employee.isApproved);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: employees.length,
    approved: employees.filter(emp => emp.isApproved).length,
    pending: employees.filter(emp => !emp.isApproved).length,
  };

  if (user?.userType !== "COMPANY_ADMIN") {
    return (
      <div className="text-center py-8">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Access Denied
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Only company admins can view this page
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
            Company Employees
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your company's employee registrations and approvals
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Employees</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending Approval</option>
        </select>
      </div>

      {/* Employees List */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No employees found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter" 
                : "No employees have registered yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {employee.image ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={employee.image}
                              alt={employee.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.position || "Not specified"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.isApproved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!employee.isApproved ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEmployeeAction(employee.id, true)}
                            className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEmployeeAction(employee.id, false)}
                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          <CheckCircle className="w-5 h-5" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyEmployees;
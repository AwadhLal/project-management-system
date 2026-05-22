import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  X, 
  User,
  Mail,
  Building2,
  CheckCircle,
  Clock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../configs/api";
import toast from "react-hot-toast";

const ProjectAssignment = ({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName, 
  currentMembers = [],
  onMembersUpdated 
}) => {
  const { getToken, user } = useAuth();
  const [companyEmployees, setCompanyEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);

  const fetchCompanyEmployees = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/company/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter only approved employees
      const approvedEmployees = (data.employees || []).filter(emp => emp.isApproved);
      setCompanyEmployees(approvedEmployees);
      
    } catch (error) {
      console.error("Fetch employees error:", error);
      toast.error("Failed to fetch company employees");
    } finally {
      setFetchingEmployees(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.userType === "COMPANY_ADMIN") {
      fetchCompanyEmployees();
    }
  }, [isOpen, user]);

  useEffect(() => {
    // Pre-select current project members
    if (currentMembers.length > 0) {
      setSelectedEmployees(currentMembers.map(member => member.userId || member.id));
    }
  }, [currentMembers]);

  const filteredEmployees = companyEmployees.filter((employee) => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleAssignMembers = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      
      // This would be the API call to assign members to project
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Successfully assigned ${selectedEmployees.length} members to ${projectName}`);
      
      if (onMembersUpdated) {
        onMembersUpdated(selectedEmployees);
      }
      
      onClose();
      
    } catch (error) {
      toast.error("Failed to assign project members");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Assign Team Members
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Project: <span className="font-medium">{projectName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Selected Count */}
          {selectedEmployees.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                {selectedEmployees.length} employee(s) selected for assignment
              </p>
            </div>
          )}

          {/* Employee List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {fetchingEmployees ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading employees...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {searchTerm ? "No employees found" : "No approved employees"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Approve employees from the company dashboard first"}
                </p>
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedEmployees.includes(employee.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  onClick={() => handleEmployeeToggle(employee.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {employee.image ? (
                          <img
                            src={employee.image}
                            alt={employee.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        {selectedEmployees.includes(employee.id) && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {employee.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {employee.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {employee.department}
                          </span>
                        </div>
                        {employee.position && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {employee.position}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedEmployees.length} of {filteredEmployees.length} employees selected
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignMembers}
              disabled={loading || selectedEmployees.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Assign Members ({selectedEmployees.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAssignment;
import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiChevronDown, FiLogOut } from "react-icons/fi";
import { useAppContext } from "../../context/AppContext";
import toast from 'react-hot-toast';

import logo from "../../assets/kamal-logo.png";
import {
  FaUser,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaPaperPlane,
  FaFileDownload,
} from "react-icons/fa";

import NotificationPopup from "../../components/seller/NotificationPopup";

const EmployeeLayout = () => {
  const { setIsSeller, user, setUser } = useAppContext();
  const navigate = useNavigate();

  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);

  const menuRef = useRef(null);
  const bellRef = useRef(null);

  // API service for employee authentication
  const apiService = {
    getAuthToken: () => {
      return localStorage.getItem('token') || localStorage.getItem('authToken');
    },

    getAuthHeaders: () => {
      const token = apiService.getAuthToken();
      return {
        'Authorization': `Bearer ${token}`
      };
    },

    async getEmployeeProfile() {
      const response = await fetch('/api/employee-profile/profile/me', {
        method: 'GET',
        headers: apiService.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    }
  };

  // Check authentication and user type on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Employee Layout - Checking authentication...');
      console.log('Current user:', user);

      try {
        // Check if user exists and has the correct type
        if (!user || !user.token) {
          console.log('No user or token found, redirecting to login');
          toast.error('Please log in to access the employee dashboard');
          navigate('/');
          return;
        }

        // Check if user type is employee
        if (user.userType !== 'employee' && user.category !== 'employee' && user.category !== 'Employee') {
          console.log('User is not a regular employee:', user.userType, user.category);
          toast.error('Access denied. This area is for employees only.');
          
          // Redirect based on actual user type
          switch (user.userType) {
            case 'admin':
              navigate('/seller');
              break;
            case 'online_employee':
              navigate('/online_employee');
              break;
            default:
              navigate('/');
          }
          return;
        }

        // Verify token validity by fetching profile
        try {
          const profileResponse = await apiService.getEmployeeProfile();
          if (profileResponse.success && profileResponse.data) {
            setEmployeeData(profileResponse.data);
            console.log('Employee authentication successful');
          } else {
            throw new Error('Failed to load employee profile');
          }
        } catch (apiError) {
          console.error('API authentication failed:', apiError);
          
          // Token might be invalid, clear auth data
          if (apiError.message.includes('401') || apiError.message.includes('403')) {
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            setUser(null);
            toast.error('Your session has expired. Please log in again.');
            navigate('/');
            return;
          }
          
          // Use user data as fallback
          setEmployeeData(user);
          console.log('Using user data as fallback');
        }

      } catch (error) {
        console.error('Authentication check failed:', error);
        toast.error('Authentication failed. Please log in again.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [user, navigate, setUser]);

  const handleLogout = () => {
    console.log('Employee logging out...');
    
    // Clear all authentication data
    setIsSeller(false);
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    
    toast.success('Logged out successfully');
    navigate('/');
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setShowMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sidebarLinks = [
    { name: "View Profile", path: "/employee/profile", icon: <FaUser /> },
    { name: "View Attendance", path: "/employee/attendance", icon: <FaCalendarCheck /> },
    { name: "Check Payment", path: "/employee/salary", icon: <FaMoneyCheckAlt /> },
    { name: "Apply For Leave", path: "/employee/leave", icon: <FaPaperPlane /> },
    { name: "Download ID", path: "/employee/download_id", icon: <FaFileDownload /> },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee dashboard...</p>
        </div>
      </div>
    );
  }

  // If no valid employee user, don't render
  if (!user || !employeeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be logged in as an employee to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-2 bg-blue-900 shadow-sm border-b border-slate-700 relative">
        <a href="/" className="flex items-center gap-3">
          <img className="h-10" src={logo} alt="logo" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-white">Kamal Auto Parts</h1>
            <p className="text-xs text-slate-300 -mt-1">Employee Dashboard</p>
          </div>
        </a>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setShowSearch((p) => !p)}
              className="p-3 hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <FiSearch size={18} className="text-slate-300" />
            </button>
            {showSearch && (
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="absolute right-0 top-12 w-56 p-2 text-sm bg-white text-black rounded shadow outline-none"
                onBlur={() => setShowSearch(false)}
              />
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-3 hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <FiBell size={18} className="text-slate-300" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            <NotificationPopup
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* Employee Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium text-slate-200 transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
                {employeeData?.image ? (
                  <img
                    src={employeeData.image.startsWith('/uploads/') 
                      ? `http://localhost:4000${employeeData.image}` 
                      : employeeData.image}
                    alt="Employee Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full ${employeeData?.image ? 'hidden' : 'flex'} items-center justify-center text-white text-xs font-semibold`}
                >
                  {employeeData?.name ? employeeData.name.charAt(0).toUpperCase() : 'E'}
                </div>
              </div>
              <span className="hidden sm:block">
                {employeeData?.name || 'Employee'}
              </span>
              <FiChevronDown size={14} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="font-semibold text-gray-800">
                    {employeeData?.name || 'Employee'}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {employeeData?.empId || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {employeeData?.email || 'No email set'}
                  </p>
                </div>
                
                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700 transition-colors duration-200 flex items-center gap-3"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/employee/profile');
                  }}
                >
                  <FaUser size={14} className="text-gray-500" />
                  View Profile
                </button>
                
                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between text-gray-700 transition-colors duration-200 border-t border-gray-100"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-3">
                    <FiLogOut size={14} className="text-gray-500" />
                    Log Out
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="md:w-64 w-16 bg-slate-100 border-r border-slate-300 flex flex-col shadow-sm">
          <div className="p-4 border-b border-slate-300">
            <h2 className="hidden md:block text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Employee Menu
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2">
            {sidebarLinks.map((item) => (
              <NavLink
                to={item.path}
                key={item.name}
                end={item.path === "/employee"}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 mx-2 my-1 gap-3 font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? "bg-blue-700 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-200 hover:text-slate-800"}`
                }
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {item.icon}
                </div>
                <p className="hidden md:block">{item.name}</p>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Main Content + Footer */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <Outlet />
          </main>
          <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>© 2025 Kamal Auto Parts - Employee Dashboard</span>
              <div className="flex items-center gap-4">
                <span>Logged in as: {employeeData?.name}</span>
                <span>ID: {employeeData?.empId}</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default EmployeeLayout;
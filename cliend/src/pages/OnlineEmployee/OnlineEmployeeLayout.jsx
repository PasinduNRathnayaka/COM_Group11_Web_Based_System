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
  FaComments,
  FaList,
  FaInfoCircle,
} from "react-icons/fa";

import NotificationPopup from "../../components/seller/NotificationPopup";

// Edit Profile Modal for Online Employee
const EditProfileModal = ({ open, onClose, employeeData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    address: ''
  });

  useEffect(() => {
    if (employeeData && open) {
      setFormData({
        name: employeeData.name || '',
        email: employeeData.email || '',
        contact: employeeData.contact || '',
        address: employeeData.address || ''
      });
    }
  }, [employeeData, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    toast.success('Profile update feature coming soon!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[90%] max-w-md rounded-lg shadow-lg p-6 relative">
        <h2 className="font-semibold text-lg mb-4">ONLINE EMPLOYEE - EDIT PROFILE</h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {employeeData?.image ? (
              <img
                src={`http://localhost:4000${employeeData.image}`}
                alt="employee"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-full h-full ${employeeData?.image ? 'hidden' : 'flex'} items-center justify-center text-blue-600`}
            >
              <FaUser size={32} />
            </div>
          </div>
          <div>
            <p className="font-medium">{employeeData?.name || 'Online Employee'}</p>
            <p className="text-sm text-gray-500">{employeeData?.email || 'No email set'}</p>
            <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">E-commerce Team</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="flex flex-col gap-2">
            <label className="text-gray-600">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="border rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-gray-600">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="border rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-gray-600">Contact</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
              className="border rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-gray-600">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="border rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl leading-none text-gray-400 hover:text-red-500"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const OnlineEmployeeLayout = () => {
  const { setIsSeller, user, setUser } = useAppContext();
  const navigate = useNavigate();

  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);

  const menuRef = useRef(null);
  const bellRef = useRef(null);

  // Check authentication and user type on mount
  useEffect(() => {
    const checkAuth = () => {
      console.log('Online Employee Layout - Checking authentication...');
      console.log('Current user:', user);

      // Check if user exists
      if (!user) {
        console.log('No user found, redirecting to login');
        toast.error('Please log in to access the online employee dashboard');
        navigate('/');
        return;
      }

      // Check if user type is online_employee or has online employee category
      const isValidOnlineEmployee = 
        user.userType === 'online_employee' || 
        (user.category && (
          user.category.toLowerCase().includes('e-com') ||
          user.category.toLowerCase().includes('online') ||
          user.category === 'Employee for E-com'
        ));

      if (!isValidOnlineEmployee) {
        console.log('User is not an online employee:', user.userType, user.category);
        toast.error('Access denied. This area is for e-commerce employees only.');
        
        // Redirect based on actual user type
        switch (user.userType) {
          case 'admin':
            navigate('/seller');
            break;
          case 'employee':
            navigate('/employee');
            break;
          default:
            navigate('/');
        }
        return;
      }

      // Set employee data from user context
      setEmployeeData(user);
      setLoading(false);
      console.log('Online employee authentication successful');
    };

    checkAuth();
  }, [user, navigate]);

  const handleLogout = () => {
    console.log('Online employee logging out...');
    
    // Clear all authentication data
    setIsSeller(false);
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
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
    { name: "Profile", path: "/online_employee/profile", icon: <FaUser /> },
    { name: "View Attendance", path: "/online_employee/attendance", icon: <FaCalendarCheck /> },
    { name: "Check Payment", path: "/online_employee/salary", icon: <FaMoneyCheckAlt /> },
    { name: "Apply For Leave", path: "/online_employee/leave", icon: <FaPaperPlane /> },
    { name: "Download ID", path: "/online_employee/download-id", icon: <FaFileDownload /> },
    { name: "Customer Replies", path: "/online_employee/replies", icon: <FaComments /> },
    { name: "Order List", path: "/online_employee/order-list", icon: <FaList /> },
    { name: "Order Details", path: "/online_employee/order-details", icon: <FaInfoCircle /> },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading online employee dashboard...</p>
        </div>
      </div>
    );
  }

  // If no valid online employee user, don't render
  if (!user || !employeeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be logged in as an e-commerce employee to access this page.</p>
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
            <p className="text-xs text-slate-300 -mt-1">E-commerce Employee Dashboard</p>
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
                placeholder="Search orders, customers..."
                className="absolute right-0 top-12 w-64 p-2 text-sm bg-white text-black rounded shadow outline-none"
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

          {/* Online Employee Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium text-slate-200 transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-green-600 flex items-center justify-center">
                {employeeData?.image ? (
                  <img
                    src={`http://localhost:4000${employeeData.image}`}
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
                  {employeeData?.name ? employeeData.name.charAt(0).toUpperCase() : 'O'}
                </div>
              </div>
              <span className="hidden sm:block">
                {employeeData?.name || 'Online Employee'}
              </span>
              <FiChevronDown size={14} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="font-semibold text-gray-800">
                    {employeeData?.name || 'Online Employee'}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {employeeData?.empId || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {employeeData?.email || 'No email set'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-green-600">E-commerce Team</span>
                  </div>
                </div>
                
                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700 transition-colors duration-200 flex items-center gap-3"
                  onClick={() => {
                    setShowMenu(false);
                    setShowProfileModal(true);
                  }}
                >
                  <FaUser size={14} className="text-gray-500" />
                  Edit Profile
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
              E-commerce Menu
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2">
            {sidebarLinks.map((item) => (
              <NavLink
                to={item.path}
                key={item.name}
                end={item.path === "/online_employee"}
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
              <span>© 2025 Kamal Auto Parts - E-commerce Employee Dashboard</span>
              <div className="flex items-center gap-4">
                <span>Logged in as: {employeeData?.name}</span>
                <span>ID: {employeeData?.empId}</span>
                <span className="text-green-600">E-commerce Team</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        employeeData={employeeData}
      />
    </>
  );
};

export default OnlineEmployeeLayout;
import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiChevronDown, FiChevronRight, FiLogOut } from "react-icons/fi";
import { useAppContext } from "../../context/AppContext";

import logo from "../../assets/kamal-logo.png";
import addProductIcon from "../../assets/add-product.png";
import productListIcon from "../../assets/product-list.png";
import addEmployeeIcon from "../../assets/add-employee.png";
import employeeListIcon from "../../assets/employee-list.png";
import attendanceIcon from "../../assets/attendance.png";
import ordersIcon from "../../assets/orders.png";
import recycleBinIcon from "../../assets/orders.png"; // Add this icon
import NotificationPopup from "../../components/seller/NotificationPopup";

const EditProfileModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[90%] max-w-md rounded-xl shadow-2xl p-8 relative border border-gray-100">
        <h2 className="font-bold text-xl mb-6 text-gray-800 border-b pb-3">Edit Profile</h2>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <img
              src="https://via.placeholder.com/64"
              alt="admin"
              className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-100"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Your name</p>
            <p className="text-sm text-gray-500">yourname@gmail.com</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Name</span>
            <span className="text-gray-600">your name</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Email account</span>
            <span className="text-gray-600">yourname@gmail.com</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Password</span>
            <span className="text-gray-600">************</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Mobile number</span>
            <span className="text-blue-600 cursor-pointer hover:text-blue-700 font-medium">Add number</span>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm">
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
          >
            Cancel
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <span className="text-xl leading-none">&times;</span>
        </button>
      </div>
    </div>
  );
};

const SellerLayout = () => {
  const { setIsSeller } = useAppContext();
  const navigate = useNavigate();

  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  const menuRef = useRef(null);
  const bellRef = useRef(null);

  const handleLogout = () => {
    setIsSeller(false);
    navigate("/seller");
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

  useEffect(() => {
    fetch("http://localhost:4000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  const sidebarLinks = [
    { name: "Dashboard", path: "/seller", icon: addProductIcon },
    // { name: "Add Product", path: "/seller/add-product", icon: addProductIcon },
    { name: "Product List", path: "/seller/product-list", icon: productListIcon },
    // { name: "Add Employee", path: "/seller/add-employee", icon: addEmployeeIcon },
    { name: "Employee List", path: "/seller/employee-list", icon: employeeListIcon },
    { name: "View Attendance", path: "/seller/view-attendence", icon: attendanceIcon },
    { name: "View Salary", path: "/seller/monthly-salary", icon: employeeListIcon },
    { name: "Orders", path: "/seller/orders", icon: ordersIcon },
    { name: "Recycle Bin", path: "/seller/recycle-bin", icon: recycleBinIcon }, // New recycle bin link
  ];

  return (
    <>
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-2 bg-blue-900 shadow-sm border-b border-slate-700 relative">
        <a href="/seller/dashboard" className="flex items-center gap-3">
          <img className="h-10" src={logo} alt="logo" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-white">Kamal Auto Parts</h1>
            <p className="text-xs text-slate-300 -mt-1">Admin Dashboard</p>
          </div>
        </a>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setShowSearch((p) => !p)}
              className="p-3 hover:bg-blue-700 rounded-lg transition-colors duration-200"
            >
              <FiSearch size={18} className="text-slate-300" />
            </button>
            {showSearch && (
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="absolute right-0 top-14 w-72 p-3 text-sm bg-white text-black rounded-lg shadow-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Admin Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium text-slate-200 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                A
              </div>
              <span className="hidden sm:block">ADMIN</span>
              <FiChevronDown size={14} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="font-semibold text-gray-800">Admin</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700 transition-colors duration-200"
                  onClick={() => {
                    setShowMenu(false);
                    setShowProfileModal(true);
                  }}
                >
                  Edit Profile
                </button>
                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between text-gray-700 transition-colors duration-200 border-t border-gray-100"
                  onClick={handleLogout}
                >
                  Log Out <FiLogOut size={14} className="text-gray-500" />
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
              Navigation
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2">
            {sidebarLinks.map((item) => (
              <NavLink
                to={item.path}
                key={item.name}
                end={item.path === "/seller"}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 mx-2 my-1 gap-3 font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? "bg-blue-700 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-200 hover:text-slate-800"}`
                }
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <img src={item.icon} alt={item.name} className="w-5 h-5 opacity-75" />
                </div>
                <p className="hidden md:block">{item.name}</p>
              </NavLink>
            ))}

            {/* Category Dropdown */}
            {/* <div className="mx-2 my-1">
              <button
                onClick={() => setCatDropdownOpen((p) => !p)}
                className="w-full flex items-center justify-between py-3 px-4 font-medium text-slate-700 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-all duration-200"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img src="/category-icon.png" alt="Category" className="w-5 h-5 opacity-75" />
                  </div>
                  <p className="hidden md:block">Categories</p>
                </div>
                <div className="hidden md:block">
                  {catDropdownOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                </div>
              </button>

              {catDropdownOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {categories.map((cat) => (
                    <NavLink
                      key={cat._id}
                      to={`/seller/category/${cat.name}`}
                      className={({ isActive }) =>
                        `block py-2 px-4 text-sm rounded-md transition-all duration-200 ${
                          isActive
                            ? "text-slate-800 font-semibold bg-slate-300"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                        }`
                      }
                    >
                      <span className="hidden md:block">{cat.name}</span>
                      <span className="md:hidden text-xs">{cat.name.substring(0, 2)}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div> */}
          </div>
        </div>

        {/* Main Content + Footer */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <Outlet />
          </main>
          <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>© 2025 Kamal Auto Parts - Admin Dashboard</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-gray-700 transition-colors duration-200">About</a>
                <a href="#" className="hover:text-gray-700 transition-colors duration-200">Contact</a>
                <a href="#" className="hover:text-gray-700 transition-colors duration-200">Support</a>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default SellerLayout;
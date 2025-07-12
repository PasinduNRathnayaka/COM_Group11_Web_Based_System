import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiChevronDown, FiLogOut } from "react-icons/fi";
import { useAppContext } from "../../context/AppContext";

import logo from "../../assets/kamal-logo.png";
import addProductIcon from "../../assets/add-product.png";
import productListIcon from "../../assets/product-list.png";
import addEmployeeIcon from "../../assets/add-employee.png";
import employeeListIcon from "../../assets/employee-list.png";
import attendanceIcon from "../../assets/attendance.png";
import ordersIcon from "../../assets/orders.png";

// Import NotificationPopup
import NotificationPopup from "../../components/seller/NotificationPopup";

/* ------------------------ EditProfileModal (Unchanged) ------------------------ */
const EditProfileModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[90%] max-w-md rounded-lg shadow-lg p-6 relative">
        <h2 className="font-semibold text-lg mb-4">EMPLOYEE &gt; EDIT PROFILE</h2>

        <div className="flex items-center gap-4 mb-6">
          <img
            src="https://via.placeholder.com/64"
            alt="admin"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">Your name</p>
            <p className="text-sm text-gray-500">yourname@gmail.com</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span>Name</span>
            <span className="text-gray-600">your name</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>Email account</span>
            <span className="text-gray-600">yourname@gmail.com</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>Password</span>
            <span className="text-gray-600">************</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>Mobile number</span>
            <span className="text-blue-600 cursor-pointer">Add number</span>
          </div>
        </div>

        <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Save Change
        </button>

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl leading-none text-gray-400 hover:text-red-500"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

/* ------------------------------ SellerLayout ------------------------------ */
const EmployeeLayout = () => {
  const { setIsSeller } = useAppContext();
  const navigate = useNavigate();

  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const sidebarLinks = [
  { name: "Profile", path: "/employee/profile" },
  { name: "View Attendance", path: "/employee/attendance" },
  { name: "Check Payment", path: "/employee/salary" },
  { name: "Apply For Leave", path: "/employee/leave" },
  { name: "Download ID", path: "/employee/download-id" },
  { name: "Customer Replies", path: "/employee/replies" },
  { name: "Order Details", path: "/employee/order-details" },
  { name: "Back", path: "/employee" } // assuming this is the target for the BACK button
];

  return (
    <>
      {/* ---------------------------- Top Navbar ---------------------------- */}
      <div className="flex items-center justify-between px-4 md:px-8 py-2 bg-blue-900 text-white relative">
        {/* brand */}
        <a href="/seller/dashboard" className="flex items-center gap-3">
          <img className="h-10" src={logo} alt="logo" />
          <h1 className="hidden sm:block text-lg font-bold">Kamal Auto Parts</h1>
        </a>

        {/* actions */}
        <div className="flex items-center gap-4">
          {/* search */}
          <div className="relative">
            <button
              onClick={() => setShowSearch((p) => !p)}
              className="p-2 hover:bg-blue-800 rounded"
            >
              <FiSearch size={18} />
            </button>
            {showSearch && (
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="absolute right-0 top-10 w-56 p-2 text-sm bg-white text-black rounded shadow outline-none"
                onBlur={() => setShowSearch(false)}
              />
            )}
          </div>

          {/* bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-2 hover:bg-blue-800 rounded"
            >
              <FiBell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <NotificationPopup
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* admin dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="flex items-center gap-1 bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded text-sm font-semibold"
            >
              EMPLOYEE <FiChevronDown size={14} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-20">
                <div className="px-4 py-3 font-semibold border-b">EMPLOYEE</div>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    setShowProfileModal(true);
                  }}
                >
                  Edit Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                  onClick={handleLogout}
                >
                  Log Out <FiLogOut size={14} className="text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------- Sidebar + Main Content ---------------------- */}
      <div className="flex">
        <div className="md:w-64 w-16 border-r h-screen text-base border-blue-400 pt-4 flex flex-col bg-indigo-100">
          {sidebarLinks.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === "/seller"}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 gap-3 font-medium transition-all
                 ${isActive
                   ? "bg-blue-700 text-white border-r-4 border-blue-900"
                   : "text-gray-700 hover:bg-blue-200 hover:text-blue-900"}`
              }
            >
              <img src={item.icon} alt={item.name} className="w-6 h-6" />
              <p className="hidden md:block">{item.name}</p>
            </NavLink>
          ))}
        </div>

        <div className="flex-1 p-4 bg-gray-50 min-h-screen">
          <Outlet />
        </div>
      </div>

      {/* --------------------------- Edit Profile Modal ---------------------- */}
      <EditProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default EmployeeLayout;

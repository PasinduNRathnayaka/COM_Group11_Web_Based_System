import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import logo from "../../assets/kamal-logo.png"; // Make sure this path is correct

// 🔧 Replace with real icons or use emoji as placeholders
const dashboardicon = "📦";
const overviewicon = "📋";
const chaticon = "👥";

const SellerLayout = () => {
  const { setIsSeller } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsSeller(false);
    navigate("/seller"); // Redirect to login page
  };

  const sidebarLinks = [
    { name: "Add Product", path: "/seller", icon: dashboardicon },
    { name: "Product List", path: "/seller/product-list", icon: overviewicon },
    { name: "Add Employee", path: "/seller/add-employee", icon: chaticon },
    { name: "Employee List", path: "/seller/employee-list", icon: chaticon },
    { name: "Mark Attendance", path: "/seller/mark-attendence", icon: chaticon },
    { name: "Orders", path: "/seller/orders", icon: chaticon },
  ];

  return (
    <>
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-2 bg-blue-900 text-white">
        <a href="/">
          <div className="flex items-center gap-3">
            <img className="h-10" src={logo} alt="logo" />
            <h1 className="text-lg font-bold">Kamal Auto Parts</h1>
          </div>
        </a>
        <div className="flex items-center gap-5">
          <p>Hi! Admin</p>
          <button
            onClick={handleLogout}
            className="border rounded-full text-sm px-4 py-1 bg-blue-800 text-blue-100 hover:bg-blue-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="md:w-64 w-16 border-r h-screen text-base border-blue-400 pt-4 flex flex-col bg-indigo-100">
          {sidebarLinks.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === "/seller"}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 gap-3 font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-700 text-white border-r-4 border-blue-900"
                    : "text-gray-700 hover:bg-blue-200 hover:text-blue-900"
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <p className="md:block hidden">{item.name}</p>
            </NavLink>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 bg-gray-50 min-h-screen">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default SellerLayout;

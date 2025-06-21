// SellerLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

// 🔧 Replace with real icons or SVGs as needed
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
    { name: "Mark Attendence", path: "/seller/mark-attendence", icon: chaticon },
    { name: "Orders", path: "/seller/orders", icon: chaticon },
  ];

  return (
    <>
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white">
        <a href="/">
          <img
            className="h-9"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/dummyLogo/dummyLogoColored.svg"
            alt="dummyLogo"
          />
        </a>
        <div className="flex items-center gap-5 text-gray-500">
          <p>Hi! Admin</p>
          <button onClick={handleLogout} className="border rounded-full text-sm px-4 py-1">
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar + Main Content */}
      <div className="flex">
        <div className="md:w-64 w-16 border-r h-screen text-base border-gray-300 pt-4 flex flex-col">
          {sidebarLinks.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === "/seller"}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 gap-3 ${
                  isActive
                    ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                    : "hover:bg-gray-100/90 border-white text-gray-700"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <p className="md:block hidden text-center">{item.name}</p>
            </NavLink>
          ))}
        </div>

        {/* Main Outlet for nested routes */}
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default SellerLayout;

import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

// 🔧 Example placeholder icons – replace with real icons or SVGs
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
    { name: "Add product", path: "/seller", icon: dashboardicon },
    { name: "Product List", path: "/seller/product-list", icon: overviewicon },
    { name: "Add Employee", path: "/seller/Add-Employee", icon: chaticon },
    { name: "Employee List", path: "/seller/Employee-List", icon: chaticon },
    { name: "Employee Attendance", path: "/seller/Employee-Attendance", icon: chaticon },
    { name: "Orders", path: "/seller/Orders", icon: chaticon },
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

      {/* Sidebar */}
      <div className="md:w-64 w-16 border-r h-screen text-base border-gray-300 pt-4 flex flex-col">
        {sidebarLinks.map((item, index) => (
          <a
            href={item.path}
            key={index}
            className={`flex items-center py-3 px-4 gap-3 
              ${index === 0
                ? "border-r-4 md:border-r-[6px] bg-indigo-500/10 border-indigo-500 text-indigo-500"
                : "hover:bg-gray-100/90 border-white text-gray-700"
              }`}
          >
            {item.icon}
            <p className="md:block hidden text-center">{item.name}</p>
          </a>
        ))}
      </div>
    </>
  );
};

export default SellerLayout;

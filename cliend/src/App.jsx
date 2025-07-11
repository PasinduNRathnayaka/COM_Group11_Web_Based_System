import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useAppContext } from "./context/AppContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModel";
import { Toaster } from "react-hot-toast";

import Home from "./pages/User/Home";
import SignUp from "./pages/User/SignUp";
import Profile from "./pages/User/Profile";
import Cart from "./pages/User/Cart";
import Checkout from "./pages/User/Checkout";
import ProductDetails from "./pages/User/ProductDetails";

import SellerLogin from "./pages/seller/SellerLogin";
import SellerLayout from "./pages/seller/SellerLayout";
import Dashboard from "./pages/seller/Dashboard";
import AddProduct from "./pages/seller/AddProduct";
import ProductList from "./pages/seller/ProductList";
import AddEmployee from "./pages/seller/AddEmployee";
import EmployeeList from "./pages/seller/EmployeeList";
import Orders from "./pages/seller/Orders";
import MarkAttendance from "./pages/seller/MarkAttendence";

import ViewAttendance from "./components/Employee/ViewAttendance";

const App = () => {
  const location = useLocation();
  const isSellerPath = location.pathname.startsWith("/seller");
  const isEmployeePath = location.pathname.startsWith("/view-attendance");

  const { isSeller, showUserLogin, navigate, setShowUserLogin } = useAppContext();

  const handleSignInClick = () => {
    setShowUserLogin(false);
    navigate("/signup");
  };

  return (
    <div className="text-default min-h-screen text-gray-700 bg-white">
      

      

     
     

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route
            path="/seller"
            element={isSeller ? <SellerLayout /> : <SellerLogin />}
          >
            <Route index element={<AddProduct />} />
            <Route path="Dashboard" element={<Dashboard />} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="add-employee" element={<AddEmployee />} />
            <Route path="employee-list" element={<EmployeeList />} />
            <Route path="orders" element={<Orders />} />
            <Route path="mark-attendence" element={<MarkAttendance />} />
          </Route>
        </Routes>
      </div>

      <div className={`${isEmployeePath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path="/view-attendance" element={<ViewAttendance />} />
        </Routes>
      </div>

      {!isSellerPath && <Footer />}
    </div>
  );
};

export default App;

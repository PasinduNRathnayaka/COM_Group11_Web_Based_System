// App.jsx
import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EmployeeScanner from './pages/QRScanner/EmployeeScanner';

import Home from './pages/User/Home' //new
import LoginModal from './components/LoginModel' //new
import SignUp from './pages/User/SignUp' //new
import Footer from './components/Footer';
import Cart from './pages/User/Cart';
import Checkout from './pages/User/Checkout';
import ProductDetails from './pages/User/ProductDetails';
import AllProducts from './pages/User/AllProducts';
import Contact from './pages/User/Contact';

//import MyOrders from './pages/User/MyOrders'
//import OrderHistory from './pages/User/OrderHistory'
import Profile from './pages/User/Profile'


import SellerLogin from './pages/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';

import Dashboard from './pages/seller/Dashboard';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import AddEmployee from './pages/seller/AddEmployee';
import EmployeeList from './pages/seller/EmployeeList';
import Orders from './pages/seller/Orders';
import MarkAttendance from './pages/seller/MarkAttendence'; 
import CategoryProductList from './pages/seller/CategoryProductList';
import EditEmployeeForm from './pages/seller/EditEmployeeForm';
import EditProductForm from './pages/seller/EditProductPage';
import ViewAttendance from './pages/seller/AttendancePage'; 
import AttendanceScanner from "./pages/QRScanner/AttendanceScanner";
import MonthlySalary from './pages/seller/MonthlySalary';

// DEF01
//new
import SidebarLayout from "./components/SidebarLayout";
import CustomerReplies from "./pages/OnlineEmployee/CustomerReplies";
import OrderDetails from "./pages/OnlineEmployee/OrderDetails";
import OrderList from "./pages/OnlineEmployee/OrderList";
import ChatBox from "./components/ChatBox"

import EmployeeProfile from "./pages/Employee/Profile";
import EditProfile from "./pages/Employee/EditProfile";

import EmployeeLayout from './pages/Employee/EmployeeLayout';

//import Attendance from "./pages/employee/Attendance";
import Viewattendance from './pages/Employee/Viewattendance';

import OnlineEmloyeeLayout from './pages/OnlineEmployee/OnlineEmployeeLayout';
import Attendance from "./pages/Employee/Attendance";

import CheckPayment from "./pages/Employee/CheckPayment";


import ApplyLeave from "./pages/Employee/ApplyLeave";

import DownloadID from "./pages/Employee/DownloadID";



//main

const App = () => {
  const location = useLocation();
  const isSellerPath = location.pathname.startsWith("/seller") || location.pathname.startsWith("/employee") || location.pathname.startsWith("/online_employee")  || location.pathname.startsWith("/attendance-scanner");
  const { isSeller, showUserLogin, navigate, setShowUserLogin, user, setUser  } = useAppContext(); //new
  
//new
const handleSignInClick = () => {     
    setShowUserLogin(false)  // Close login modal
    navigate('/signup')      // Redirect to /signup page
  }


  useEffect(() => {
  // Delay logout if invalid user is on "/" — prevent interfering with initial login redirects
  let timeout;
  
  if (location.pathname === '/' && user && user.userType !== 'user') {
    timeout = setTimeout(() => {
      localStorage.removeItem('userData');
      setUser(null);
      navigate('/', { replace: true });
    }, 300); // Give time for redirects to seller/employee/etc.
  }

  return () => {
    if (timeout) clearTimeout(timeout);
  };
}, [location.pathname, user]);

//new

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      {/* {!isSellerPath && <Navbar />} */}
     {/* Optional login modal */}
      {/* {showUserLogin && <Login />}  */}
{/* new  */}
     {isSellerPath ? null : <Navbar />}
      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/signup' element={<SignUp />} /> 

           <Route path='/profile' element={<Profile />} />

           <Route path="/cart" element={<Cart />} />

           <Route path="/checkout" element={<Checkout />} />

           <Route path="/product/:id" element={<ProductDetails />} />

          <Route path="/allproducts" element={<AllProducts />} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/attendance-scanner" element={<AttendanceScanner />} />

        </Routes>
      </div>
{/* new  */}

     {/* Render login modal */}
      <LoginModal isOpen={showUserLogin} onClose={() => setShowUserLogin(false)} 

      onSignInClick={handleSignInClick}
      />
{/* new  */}
      <Toaster />

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          {/* Login if not seller, else show layout with nested routes */}
          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="add-employee" element={<AddEmployee />} />
            <Route path="employee-list" element={<EmployeeList />} />
            <Route path="orders" element={<Orders />} />
            <Route path="view-attendence" element={<ViewAttendance />} />
            <Route path="/seller/edit-employee/:id" element={<EditEmployeeForm />} />
            <Route path="/seller/edit-product/:id" element={<EditProductForm />} />
            <Route path="monthly-salary" element={<MonthlySalary />} />

            {/* ✅ Category Page */}
            <Route path="category/:categoryName" element={<CategoryProductList />} />
          </Route>
        </Routes>
      </div>

      {/* new Employee */}

        <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<Attendance />} />

          <Route path="/employee/profile" element={<EmployeeProfile />} />
          <Route path="/employee/edit-profile" element={<EditProfile />} />
          
          <Route path="/employee/salary" element={<CheckPayment />} />

          <Route path="/employee/leave" element={<ApplyLeave />} />

          <Route path="/employee/download_id" element={<DownloadID />} />
          
          <Route path="attendance" element={<Viewattendance />} />

        </Route>

        </Routes>
      </div>

      {/* new Employee */}

       {/* new online Employee */}

        <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path="/online_employee" element={<OnlineEmloyeeLayout />}>
          <Route index element={<Attendance />} />
          <Route path="replies" element={<CustomerReplies />} />
          <Route path="order-details" element={<OrderDetails />} />
          <Route path="order-list" element={<OrderList />} />


          <Route path="employee/profile" element={<EmployeeProfile />} />
          <Route path="employee/edit-profile" element={<EditProfile />} />
       
         <Route path="attendance" element={<Viewattendance />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="edit-profile" element={<EditProfile />} />
               
          <Route path="salary" element={<CheckPayment />} />

          <Route path="leave" element={<ApplyLeave />} />

          <Route path="download-id" element={<DownloadID />} />


          <Route path="salary" element={<CheckPayment />} />


        </Route>
        </Routes>
      </div>

      <div className="App">
      <ChatBox />
    </div>

      {/* new online Employee */}

      {/* QR */}

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path="/qr_scanner" element={<EmployeeScanner />}>
        </Route>
        </Routes>
      </div>

{/* DEF01// */}
      {!isSellerPath && <Footer />}
    </div>
  );
};

export default App;

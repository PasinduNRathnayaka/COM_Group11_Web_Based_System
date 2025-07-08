// App.jsx
import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { Toaster } from 'react-hot-toast';


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

const App = () => {
  const location = useLocation();
  const isSellerPath = location.pathname.startsWith("/seller");
  const { isSeller, showUserLogin, navigate, setShowUserLogin } = useAppContext(); //new
//new
const handleSignInClick = () => {     
    setShowUserLogin(false)  // Close login modal
    navigate('/signup')      // Redirect to /signup page
  }
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

          <Route path="/product" element={<AllProducts />} />

          <Route path="/contact" element={<Contact />} />


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
          <Route path="/seller" element={isSeller ? <SellerLayout /> : <SellerLogin />}>
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

      {!isSellerPath && <Footer />}
    </div>
  );
};

export default App;

// App.jsx
import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { Toaster } from 'react-hot-toast';

import SellerLogin from './pages/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';

import Addproduct from './pages/seller/Addproduct';
import ProductList from './pages/seller/ProductList';
import AddEmployee from './pages/seller/AddEmployee';
import EmployeeList from './pages/seller/EmployeeList';
import Orders from './pages/seller/Orders';
import MarkAttendance from './pages/seller/MarkAttendence';

const App = () => {
  const location = useLocation();
  const isSellerPath = location.pathname.startsWith("/seller");
  const { isSeller, showUserLogin } = useAppContext();

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      {!isSellerPath && <Navbar />}
      {/* Optional login modal */}
      {showUserLogin && <Login />} 
      <Toaster />

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          {/* Login if not seller, else show layout with nested routes */}
          <Route path="/seller" element={isSeller ? <SellerLayout /> : <SellerLogin />}>
            <Route index element={<Addproduct />} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="add-employee" element={<AddEmployee />} />
            <Route path="employee-list" element={<EmployeeList />} />
            <Route path="orders" element={<Orders />} />
            <Route path="mark-attendence" element={<MarkAttendance />} />
          </Route>
        </Routes>
      </div>

      {!isSellerPath && <footer />}
    </div>
  );
};

export default App;

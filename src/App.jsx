import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import SellerLogin from './pages/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout'; // ✅ import SellerLayout

const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");
  const { isSeller } = useAppContext();

  return (
    <div>
      {!isSellerPath && <Navbar />}
      <Toaster />

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path="/seller" element={isSeller ? <SellerLayout /> : <SellerLogin />} /> {/* Show SellerLogin only when not logged in */}
        </Routes>
      </div>

      {!isSellerPath && <footer />}
    </div>
  );
};

export default App;

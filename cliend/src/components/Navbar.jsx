import React from 'react';
import logo from "../assets/kamal-logo.png";
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const { user, setUser, setShowUserLogin, navigate } = useAppContext();

  const logout = async () => {
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-blue-900 relative transition-all text-white">
      
      <NavLink to='/' onClick={() => setOpen(false)}>
        <div className="flex items-center gap-2">
          <img className="h-10" src={assets.kamal_logo} alt="logo2" />
          <h1 className="text-lg font-bold text-white">Kamal Auto Parts</h1>
        </div> 
      </NavLink>

      {/* ✅ Desktop Menu */}
      <div className="hidden sm:flex flex-1 absolute -left-0.01 gap-12 text-white font-medium pl-100">
        <NavLink to='/'>Home</NavLink>
        <Link to="/allproducts" className="font-medium">
          All Products
        </Link>
        <NavLink to="/contact">Contact</NavLink>
      </div>

   {/*
        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search products" />
          <img src={assets.search} alt='search' className='w-4 h-4'/>
        </div>

  */}

       
      <div className="hidden sm:flex items-center gap-6">

  {/* 👤 Auth Buttons */}
  {!user ? (
    <button
      onClick={() => setShowUserLogin(true)}
      className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full"
    >
      Login
    </button>
  ) : (
    <>
      <button
        onClick={() => navigate("/profile")}
        className="px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-full transition"
      >
        My Profile
      </button>
      <button
        onClick={logout}
        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
      >
        Logout
      </button>
    </>
      )}

      {/* 🛒 Cart Icon */}
      <div onClick={() => navigate("/cart")} className="relative cursor-pointer -right-5">
        <img src={assets.cart} alt='cart' className='w-6 opacity-80' />
        <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">3</button>
      </div>

    </div>
      

      {/* Mobile Menu Toggle */}
      <button onClick={() => setOpen(!open)} aria-label="Menu" className="sm:hidden">
        <img src={assets.menu} alt='menu' className='w-6 h-6' />
      </button>

      {/* ✅ Mobile Menu */}
      {open && (
        <div className="absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden text-black">
          <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/product" onClick={() => setOpen(false)}>All Products</NavLink>

          {user && <NavLink to="/my-orders" onClick={() => setOpen(false)}>My Orders</NavLink>}
          <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>


          {/* ✅ Updated mobile login/logout/profile buttons */}
          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="mt-2 px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-full w-full"
            >
              Login
            </button>
          ) : (
            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-full"
              >
                My Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

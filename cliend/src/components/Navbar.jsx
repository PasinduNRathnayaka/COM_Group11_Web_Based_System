import React from 'react';
import logo from "../assets/kamal-logo.png";
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const { user, setUser, setShowUserLogin, navigate, cartItems } = useAppContext();

  const logout = async () => {
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 lg:px-16 xl:px-24 py-4 border-b border-gray-300 bg-blue-900 relative transition-all text-white">
      
      <NavLink to='/' onClick={() => setOpen(false)}>
        <div className="flex items-center gap-2">
          <img className="h-8 md:h-10" src={assets.kamal_logo} alt="logo2" />
          <h1 className="text-sm md:text-lg font-bold text-white">Kamal Auto Parts</h1>
        </div> 
      </NavLink>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-8 xl:gap-12 text-white font-medium">
        <NavLink to='/'>Home</NavLink>
        <Link to="/allproducts" className="font-medium">
          All Products
        </Link>

        <NavLink 
          to={user ? "/contact" : "#"} 
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              toast.error('Please login first to access contact page');
            }
          }}
        >
          Contact
        </NavLink>
      </div>

   {/*
        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search products" />
          <img src={assets.search} alt='search' className='w-4 h-4'/>
        </div>

  */}

       
  <div className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-6">

  {/* Auth Buttons */}
  {!user ? (
    <button
      onClick={() => setShowUserLogin(true)}
      className="cursor-pointer px-4 lg:px-6 xl:px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm lg:text-base"
    >
      Login
    </button>
  ) : (
    <>
      <button
        onClick={() => navigate("/profile")}
        className="px-3 lg:px-4 xl:px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-full transition text-sm lg:text-base"
      >
        My Profile
      </button>
      <button
        onClick={logout}
        className="px-3 lg:px-4 xl:px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm lg:text-base"
      >
        Logout
      </button>
    </>
      )}

      {/*Cart Icon */}
        <div 
            onClick={() => {
              if (user) {
                navigate("/cart");
              } else {
                toast.error('Please login first to access your cart');
              }
            }} 
            className="relative cursor-pointer"
          >
        <img src={assets.cart} alt='cart' className='w-6 opacity-80' />
        <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full"> {cartItems.length}</button>
      </div>

    </div>
      

      {/* Mobile Menu Toggle */}
      <button onClick={() => setOpen(!open)} aria-label="Menu" className="md:hidden">
        <img src={assets.menu} alt='menu' className='w-6 h-6' />
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-full right-4 w-64 bg-white shadow-lg py-4 px-4 md:hidden z-50 rounded-lg">
          <div className="flex flex-col gap-3 text-black">
            <NavLink to="/" onClick={() => setOpen(false)} className="py-2 px-3 hover:bg-gray-100 rounded">Home</NavLink>
            <NavLink to="/allproducts" onClick={() => setOpen(false)} className="py-2 px-3 hover:bg-gray-100 rounded">All Products</NavLink>
            <NavLink 
              to={user ? "/contact" : "#"} 
              onClick={(e) => {
                setOpen(false);
                if (!user) {
                  e.preventDefault();
                  toast.error('Please login first to access contact page');
                }
              }} 
              className="py-2 px-3 hover:bg-gray-100 rounded"
            >
              Contact
          </NavLink>
          

          {/* Updated mobile login/logout/profile buttons */}
          <div className="border-t pt-3 mt-3">
          {!user ? (
            <button
              onClick={() => {
                setShowUserLogin(true);
                setOpen(false);
              }}
              className="w-full px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-full"
            >
              Login
            </button>
          ) : (
            <div className="flex flex-col gap-2">
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
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
              >
                Logout
              </button>
            </div>
          )}
           </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

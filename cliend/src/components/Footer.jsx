import { assets } from "../assets/assets";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const [shopDetails, setShopDetails] = useState({
    //address: "100/1 Wanarathuduwa Road, Katukurunda, Sri Lanka",
   // email: "kamalautolg@gmail.com",
   // phone: "0777819999",
    //name: "Kamal Auto"
  });
  const [loading, setLoading] = useState(true);

  // Fetch shop details from admin backend
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        // 🔥 Updated: Fetch admin details from the new endpoint
        const response = await fetch('/api/admin/shop-details');
        
        if (!response.ok) {
          throw new Error('Failed to fetch shop details');
        }

        const data = await response.json();
        
        if (data.success && data.shopDetails) {
          setShopDetails({
            address: data.shopDetails.address ,
            email: data.shopDetails.email ,
            phone: data.shopDetails.phone,
            name: data.shopDetails.name
          });
        }
      } catch (error) {
        //console.error('Error fetching shop details:', error);
        // Keep default values if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, []);

  const handleContactClick = () => {
    navigate('/contact');
  };

  const handleAboutClick = () => {
    navigate('/about');
  };

  const handleLinkClick = (link) => {
    switch(link) {
      case 'Privacy Notice':
        navigate('/privacy');
        break;
      case 'Terms':
        navigate('/terms');
        break;
      case 'Return Policy':
        navigate('/return-policy');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <footer className="w-full border-t border-gray-300 bg-gray-100 text-sm">
        <div className="w-full py-4">
          <div className="flex flex-wrap justify-between px-6 md:px-16 lg:px-24 xl:px-32">
            <div className="text-sm w-full md:w-[22%] text-left">
              <div className="animate-pulse">
                <div className="w-28 h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-200">
          © Copyright 2025. All Rights Reserved.
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t border-gray-300 bg-gray-100 text-sm">
      <div className="w-full py-4">
        <div className="flex flex-wrap justify-between px-6 md:px-16 lg:px-24 xl:px-32">
          <div className="text-sm w-full md:w-[22%] text-left">
            <img src={assets.kamal_logo} alt="logo" className="w-28 mb-4" />
            <p>
              <strong>Address:</strong><br />
              {shopDetails.address}
            </p>
            <p className="mt-2">
              <strong>Email:</strong> 
              <a 
                href={`mailto:${shopDetails.email}`} 
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                {shopDetails.email}
              </a>
            </p>
            <p>
              <strong>Phone:</strong> 
              <a 
                href={`tel:${shopDetails.phone}`} 
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                {shopDetails.phone}
              </a>
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Useful Links</h4>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => handleLinkClick('Privacy Notice')}
                  className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Privacy Notice
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('Terms')}
                  className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Terms
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('Return Policy')}
                  className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Return Policy
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Customer Service</h4>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={handleContactClick}
                  className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button 
                  onClick={handleAboutClick}
                  className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Follow Us</h4>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
              >
                <img 
                  src="https://img.icons8.com/fluency/48/facebook-new.png" 
                  className="w-6" 
                  alt="Facebook"
                />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
              >
                <img 
                  src="https://img.icons8.com/fluency/48/instagram-new.png" 
                  className="w-6" 
                  alt="Instagram"
                />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
              >
                <img 
                  src="https://img.icons8.com/fluency/48/twitter.png" 
                  className="w-6" 
                  alt="Twitter"
                />
              </a>
              <a 
                href={`https://wa.me/${shopDetails.phone.replace(/\D/g, '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
              >
                <img 
                  src="https://img.icons8.com/fluency/48/whatsapp.png" 
                  className="w-6" 
                  alt="WhatsApp"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-200">
        © Copyright 2025. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
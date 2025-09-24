import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets'; 
import { useAppContext } from '../../context/AppContext';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Contact = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const [shopDetails, setShopDetails] = useState({
    name: "KAMAL AUTO PARTS",
    address: "No 128, Wewurukannala Road, Kekanadura, Sri Lanka",
    email: "kamalautoparts@gmail.com",
    phone: "+94 0777 555 919"
  });

  const [loading, setLoading] = useState(false);
  const [shopLoading, setShopLoading] = useState(true);

  if (!user) return <Navigate to="/" replace />;

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
            address: data.shopDetails.address || "100/1 Wanarathuduwa Road, Katukurunda, Sri Lanka",
            email: data.shopDetails.email || "kamalautolg@gmail.com",
            phone: data.shopDetails.phone || "0777819999",
            name: "KAMAL AUTO PARTS"
          });
        }
      } catch (error) {
        console.error('Error fetching shop details:', error);
        // Keep default values if fetch fails
      } finally {
        setShopLoading(false);
      }
    };

    fetchShopDetails();
  }, []);

  // Autofill form data with user information when component mounts
  useEffect(() => {
    if (user) {
      // Extract first and last name from user object
      // Adjust these field names based on your user object structure
      const firstName = user.firstName || user.first_name || '';
      const lastName = user.lastName || user.last_name || '';
      const email = user.email || '';
      
      // Alternative: If user has a full name field, split it
      let extractedFirstName = firstName;
      let extractedLastName = lastName;
      
      if (!firstName && !lastName && user.name) {
        const nameParts = user.name.trim().split(' ');
        extractedFirstName = nameParts[0] || '';
        extractedLastName = nameParts.slice(1).join(' ') || '';
      }

      setFormData(prevData => ({
        ...prevData,
        firstName: extractedFirstName,
        lastName: extractedLastName,
        email: email
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Message sent successfully!');
        // Reset only subject and message, keep user info
        setFormData(prevData => ({
          ...prevData,
          subject: '',
          message: ''
        }));
      } else {
        toast.error(result.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return "+94 0777 555 919";
    
    // Remove any existing formatting
    const cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 94, format as international
    if (cleaned.startsWith('94')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    
    // If it starts with 0, format as local
    if (cleaned.startsWith('0')) {
      return `+94 ${cleaned.slice(1, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    
    return phone;
  };

  return (
    <div>
      {/* 🔷 Top Blue Section with Contact Info */}
      <div className="bg-blue-500 text-white py-10 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 rounded-b-2xl">
        {shopLoading ? (
          // Loading skeleton for shop details
          <div className="animate-pulse">
            <div className="h-8 bg-blue-400 rounded w-64 mb-2"></div>
            <div className="h-4 bg-blue-400 rounded w-80 mb-6"></div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="h-4 bg-blue-400 rounded w-20 mb-2"></div>
                <div className="h-4 bg-blue-400 rounded w-48"></div>
              </div>
              <div>
                <div className="h-4 bg-blue-400 rounded w-16 mb-2"></div>
                <div className="h-4 bg-blue-400 rounded w-32"></div>
              </div>
              <div>
                <div className="h-4 bg-blue-400 rounded w-12 mb-2"></div>
                <div className="h-4 bg-blue-400 rounded w-40"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">{shopDetails.name}</h1>
            <p className="mb-6 text-sm md:text-base">We'd love to hear from you. Let's get in touch.</p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="font-semibold">📍 Address</p>
                <p>{shopDetails.address}</p>
              </div>
              <div>
                <p className="font-semibold">📞 Phone</p>
                <a 
                  href={`tel:${shopDetails.phone.replace(/\D/g, '')}`}
                  className="hover:text-blue-200 transition-colors cursor-pointer"
                >
                  {formatPhoneNumber(shopDetails.phone)}
                </a>
              </div>
              <div>
                <p className="font-semibold">📧 Email</p>
                <a 
                  href={`mailto:${shopDetails.email}`}
                  className="hover:text-blue-200 transition-colors cursor-pointer"
                >
                  {shopDetails.email}
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 🔘 Contact Form + Image Section */}
      <div className="bg-white py-10 px-4 md:px-20">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Left Side: Form */}
          <div className="space-y-6 bg-gray-100 rounded-xl p-6 shadow-md">
            <h1>Message us for all your questions and opinions</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                name="message"
                placeholder="Message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className="p-3 border rounded w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dull transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Right Side: Image */}
          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src={assets.lap}
              alt="Contact"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Google Map */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-center">Find Us Here</h2>
          <iframe
            title="Kamal Auto Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63317.39405935737!2d80.51600484031252!3d5.948351038750421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae140f6a3ac2f11%3A0x6f2cb7a2c2a75d83!2sMatara!5e0!3m2!1sen!2slk!4v1621781714811!5m2!1sen!2slk"
            width="100%"
            height="350"
            allowFullScreen=""
            loading="lazy"
            className="rounded-lg shadow-lg border"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;

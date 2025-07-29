import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import { Navigate } from 'react-router-dom';

const About = () => {
  const { user } = useAppContext();
  const [shopDetails, setShopDetails] = useState({
    name: "KAMAL AUTO PARTS",
    address: "No 128, Wewurukannala Road, Kekanadura, Sri Lanka",
    email: "kamalautoparts@gmail.com",
    phone: "+94 0777 555 919"
  });
  const [loading, setLoading] = useState(true);

  // Fetch shop details from backend
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const response = await fetch('/api/employees');
        const employees = await response.json();
        
        const seller = employees.find(emp => 
          emp.category === 'seller' || 
          emp.category === 'admin' || 
          emp.role === 'seller' || 
          emp.role === 'admin'
        );
        
        if (seller) {
          setShopDetails({
            name: "KAMAL AUTO PARTS",
            address: seller.address || "No 128, Wewurukannala Road, Kekanadura, Sri Lanka",
            email: seller.email || "kamalautoparts@gmail.com",
            phone: seller.contact || "+94 0777 555 919"
          });
        }
      } catch (error) {
        console.error('Error fetching shop details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-blue-500 text-white py-16 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 rounded-b-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{shopDetails.name}</h1>
          <p className="text-lg opacity-90">Your trusted partner for quality auto parts in Sri Lanka</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-12 px-4 md:px-20">
        <div className="max-w-6xl mx-auto">
          
          {/* Our Story Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Established with a vision to provide high-quality automotive parts and exceptional service, 
                Kamal Auto Parts has been serving the automotive community in Sri Lanka for years. What started 
                as a small local business has grown into a trusted name in the automotive parts industry.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We understand that your vehicle is more than just transportation – it's your lifeline to work, 
                family, and adventures. That's why we're committed to providing only the finest auto parts and 
                accessories to keep you moving forward with confidence.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Located in the heart of Kekanadura, we've built our reputation on trust, quality, and 
                unmatched customer service. Every part we sell comes with our guarantee of authenticity and performance.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src={assets.lap} 
                alt="Kamal Auto Parts Store" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-blue-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To provide our customers with genuine, high-quality automotive parts at competitive prices, 
                backed by expert advice and exceptional service. We strive to be the first choice for 
                automotive enthusiasts, mechanics, and everyday drivers across Sri Lanka.
              </p>
            </div>
            <div className="bg-green-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-green-600 mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To become Sri Lanka's most trusted automotive parts retailer, known for our comprehensive 
                inventory, reliable service, and commitment to keeping vehicles running safely and efficiently 
                on the roads of our beautiful island nation.
              </p>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Why Choose Kamal Auto Parts?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🔧</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">Quality Guaranteed</h4>
                <p className="text-gray-600">
                  We source only genuine and high-quality parts from trusted manufacturers and suppliers.
                </p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🚗</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">Wide Selection</h4>
                <p className="text-gray-600">
                  Extensive inventory covering parts for various vehicle makes and models.
                </p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">💰</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">Competitive Prices</h4>
                <p className="text-gray-600">
                  Fair pricing without compromising on quality, ensuring great value for your money.
                </p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Services</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 p-4 bg-white border rounded-lg shadow-sm">
                <span className="text-2xl">🛒</span>
                <div>
                  <h4 className="font-semibold text-lg">Online Shopping</h4>
                  <p className="text-gray-600">Browse and purchase parts from the comfort of your home with our easy-to-use online platform.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-white border rounded-lg shadow-sm">
                <span className="text-2xl">🚚</span>
                <div>
                  <h4 className="font-semibold text-lg">Fast Delivery</h4>
                  <p className="text-gray-600">Quick and reliable delivery service across Sri Lanka to get your parts when you need them.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-white border rounded-lg shadow-sm">
                <span className="text-2xl">💬</span>
                <div>
                  <h4 className="font-semibold text-lg">Expert Advice</h4>
                  <p className="text-gray-600">Our knowledgeable team provides professional guidance to help you find the right parts.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-white border rounded-lg shadow-sm">
                <span className="text-2xl">🔄</span>
                <div>
                  <h4 className="font-semibold text-lg">Easy Returns</h4>
                  <p className="text-gray-600">Hassle-free return policy for your peace of mind when shopping with us.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <p className="mb-6">Ready to find the perfect parts for your vehicle? Contact us today!</p>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-blue-400 rounded w-64 mx-auto mb-2"></div>
                <div className="h-4 bg-blue-400 rounded w-48 mx-auto mb-2"></div>
                <div className="h-4 bg-blue-400 rounded w-40 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <p>📍 {shopDetails.address}</p>
                <p>📞 <a href={`tel:${shopDetails.phone.replace(/\D/g, '')}`} className="hover:text-blue-200">{shopDetails.phone}</a></p>
                <p>📧 <a href={`mailto:${shopDetails.email}`} className="hover:text-blue-200">{shopDetails.email}</a></p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;
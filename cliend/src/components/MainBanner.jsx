import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

import RateUsPopup from '../components/RateUsPopup'; 
import { useState } from 'react';

import { useEffect } from 'react';



const MainBanner = () => {

const { user } = useAppContext();

const [showRatePopup, setShowRatePopup] = useState(false);

useEffect(() => {
  if (user) {
    setShowRatePopup(false);
  }
}, [user]);

  return (
    <>
      {/* Top Banner Image */}
      <div className='relative h-[300px] md:h-[400px] overflow-hidden'>
        <img 
          src={assets.mainbanner_lr} 
          alt="banner" 
          className='w-full h-full object-cover hidden md:block' 
        />
        <img 
          src={assets.mainbanner_sm} 
          alt="banner" 
          className='w-full h-full object-cover md:hidden' 
        />
      </div>

    {/* Show "Rate Us" only for logged-in users */}
      {user && (
        <div className="w-full flex justify-end pr-6 mt-6">
          <button
            className="text-sm text-primary hover:underline font-semibold"
            onClick={() => setShowRatePopup(true)}
          >
            We’d love your feedback! Rate us & help us improve →
          </button>
        </div>
      )}

      {/* Content Below the Banner */}
      <div className="flex flex-col items-center justify-center text-left px-4 mt-8 mb-12">
        <h1 className='text-2xl md:text-4xl font-bold mb-6'>
          Explore Genuine Auto Parts at the Best Prices
        </h1>

        {user && ( 
          <>
         
          <div className="flex flex-col md:flex-row gap-4">
          <Link 
            to="/products" 
            className='group flex items-center gap-2 px-7 md:px-9 py-3 bg-primary hover:bg-primary-dull transition rounded text-white cursor-pointer'
          >
            Shop Now
            <img 
              className='w-4 transition group-hover:translate-x-1' 
              src={assets.arrow} 
              alt="arrow" 
            />
          </Link>

         <Link 
         to="/products" 
         className='group flex items-center gap-2 px-9 py-3 bg-primary hover:bg-primary-dull transition rounded text-white cursor-pointer'
>
         Explore Deals
        <img 
           className='w-4 transition group-hover:translate-x-1' 
           src={assets.arrow} 
           alt="arrow" 
         />
       </Link>

        </div>

           {showRatePopup && <RateUsPopup onClose={() => setShowRatePopup(false)} />}

        </>
        )}
      </div>

     {/* ✅ SHOW THIS ONLY FOR GUEST USERS (NOT LOGGED IN) */}
{!user && (
  <>

     {/* ✅ MAIN CATEGORIES Section */}
<div className="px-4 mt-12 mb-16">
  <h1 className="text-left text-xl md:text-2xl font-bold mb-6">
    Main Categories
  </h1>

  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
    {[
      { name: 'Engine', image: assets.Bugatti_Chiron_Engine },
      { name: 'Brakes', image: assets.brakes_suspension },
      { name: 'Tires', image: assets.Tires_and_Wheels },
      { name: 'Exterior', image: assets.Exterior_and_Body_parts },
      { name: 'Interior', image: assets.Interior },
      { name: 'Filters', image: assets.Filters },
      { name: 'Lights', image: assets.lights },
      { name: 'Exhaust', image: assets.exhaust },
    ].map((cat, i) => (
      <div
        key={i}
        className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition cursor-pointer"
      >
        <img
          src={cat.image}
          alt={cat.name}
          className="w-16 h-16 mx-auto mb-2 object-contain"
        />
        <p className="text-sm font-medium">{cat.name}</p>
      </div>
    ))}
  </div>
</div>


    {/* Related Products */}
    <div className="px-4 mt-16 mb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-left text-xl md:text-2xl font-bold">Related Products</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {Array(12).fill(0).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition cursor-pointer"
          >
            <img
              src={assets.Airfilter}
              alt="Airfilter"
              className="w-24 h-24 mx-auto mb-3 object-contain"
            />
            <p className="font-medium text-sm">Airfilter</p>
            <p className="text-sm text-gray-600 mt-1">Rs 2500</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Link
          to="/products"
          className="text-sm text-primary hover:underline font-semibold"
        >
          View More →
        </Link>
      </div>
    </div>

    {/* Happy Customers */}
    <div className="px-4 mt-16 mb-20">
      <h1 className="text-left text-xl md:text-2xl font-bold mb-6">
        Our Happy Customers
      </h1>

      <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-2">
        {[
          {
            name: "Sarah M.",
            review: "I'm blown away by the quality and style of the car accessories I received. Great service!",
          },
          {
            name: "Alex K.",
            review: "Shipping was fast, the staff was helpful, and I love the variety! Highly recommend.",
          },
          {
            name: "James L.",
            review: "Perfect experience from start to finish. Top brands, great pricing. Will shop again!",
          },
        ].map((cust, i) => (
          <div key={i} className="min-w-[250px] sm:min-w-[280px] bg-white shadow rounded-xl p-4">
            <p className="text-yellow-500 mb-2">★★★★★</p>
            <p className="text-sm italic mb-2">"{cust.review}"</p>
            <p className="text-sm font-semibold">{cust.name}</p>
          </div>
        ))}
      </div>
    </div>

    {/* About Kamal Auto Parts */}
    <div className="flex flex-col md:flex-row items-center gap-6 px-4 mt-20 mb-20">
      <img
        src={assets.wharehouse}
        alt="warehouse"
        className="h-28 md:h-44 w-full md:w-[40%] object-cover rounded-tr-[80px] rounded-br-[80px]"
      />
      <p className="text-sm md:text-base font-medium leading-relaxed text-justify">
        <strong>Kamal Auto Parts</strong> is your trusted online destination for high-quality auto parts, car accessories,
        and vehicle care products in Sri Lanka. We are dedicated to providing a wide range of genuine and imported products
        to vehicle owners, garages, and car enthusiasts across the island. Whether you’re upgrading, maintaining, or
        repairing – Kamal Auto Parts is here to deliver reliability, performance, and value, all in one place.
      </p>
    </div>
  </>
)}

{/* ✅ SHOW THIS ONLY FOR LOGGED-IN USERS */}
{user && (
  <>
 <div className="px-4 mt-12 mb-16">
  <h1 className="text-left text-xl md:text-2xl font-bold mb-6">
    Main Categories
  </h1>

  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
    {[
      { name: 'Engine', image: assets.Bugatti_Chiron_Engine },
      { name: 'Brakes', image: assets.brakes_suspension },
      { name: 'Tires', image: assets.Tires_and_Wheels },
      { name: 'Exterior', image: assets.Exterior_and_Body_parts },
      { name: 'Interior', image: assets.Interior },
      { name: 'Filters', image: assets.Filters },
      { name: 'Lights', image: assets.lights },
      { name: 'Exhaust', image: assets.exhaust },
    ].map((cat, i) => (
      <div
        key={i}
        className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition cursor-pointer"
      >
        <img
          src={cat.image}
          alt={cat.name}
          className="w-16 h-16 mx-auto mb-2 object-contain"
        />
        <p className="text-sm font-medium">{cat.name}</p>
      </div>
    ))}
  </div>
</div>

{/* For You */}
    <div className="px-4 mt-16 mb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-left text-xl md:text-2xl font-bold">For You</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {Array(12).fill(0).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition cursor-pointer"
          >
            <img
              src={assets.Airfilter}
              alt="Airfilter"
              className="w-24 h-24 mx-auto mb-3 object-contain"
            />
            <p className="font-medium text-sm">Airfilter</p>
            <p className="text-sm text-gray-600 mt-1">Rs 2500</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Link
          to="/products"
          className="text-sm text-primary hover:underline font-semibold"
        >
          View More →
        </Link>
      </div>
    </div>
</>

)}

  </>
  )
}

export default MainBanner;
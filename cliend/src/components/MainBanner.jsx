import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const MainBanner = () => {
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

      {/* Content Below the Banner */}
      <div className="flex flex-col items-center justify-center text-left px-4 mt-8 mb-12">
        <h1 className='text-2xl md:text-4xl font-bold mb-6'>
          Explore Genuine Auto Parts at the Best Prices
        </h1>

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
      </div>

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

{/* ✅ RELATED PRODUCTS Section */}
<div className="px-4 mt-16 mb-20">
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-left text-xl md:text-2xl font-bold">Related Products</h1>
    
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
    {[
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
      { name: 'Airfilter', price: 'Rs 2500', image: assets.Airfilter },
    ].map((prod, i) => (
      <div
        key={i}
        className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition cursor-pointer"
      >
        <img
          src={prod.image}
          alt={prod.name}
          className="w-24 h-24 mx-auto mb-3 object-contain"
        />
        <p className="font-medium text-sm">{prod.name}</p>
        <p className="text-sm text-gray-600 mt-1">{prod.price}</p>
      </div>
    ))}
  </div>

     {/* ✅ View More at Bottom */}
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
  )
}

export default MainBanner;
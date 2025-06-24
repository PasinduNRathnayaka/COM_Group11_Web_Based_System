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
      <div className="flex flex-col items-center justify-center text-center px-4 mt-8 mb-12">
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
    </>
  )
}

export default MainBanner
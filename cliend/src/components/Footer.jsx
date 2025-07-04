import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-300 bg-gray-100 text-sm">
      <div className="w-full py-4">
        <div className="flex flex-wrap justify-between px-6 md:px-16 lg:px-24 xl:px-32">
          <div className="text-sm w-full md:w-[22%] text-left">
            <img src={assets.kamal_logo} alt="logo" className="w-28 mb-4" />
            <p>
              Address:<br />
              100/1 Wanarathuduwa Road, Katukurunda, Sri Lanka
            </p>
            <p className="mt-2">Email: kamalautolg@gmail.com</p>
            <p>Phone: 0777819999</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Useful Links</h4>
            <ul>
              <li>Privacy Notice</li>
              <li>Terms</li>
              <li>Return Policy</li>
              <li>Delivery Grid</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Customer Service</h4>
            <ul>
              <li>Contact Us</li>
              <li>About Us</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Follow Us</h4>
            <div className="flex gap-4">
              <img src="https://img.icons8.com/fluency/48/facebook-new.png" className="w-6" />
              <img src="https://img.icons8.com/fluency/48/instagram-new.png" className="w-6" />
              <img src="https://img.icons8.com/fluency/48/twitter.png" className="w-6" />
              <img src="https://img.icons8.com/fluency/48/whatsapp.png" className="w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-200">
        © Copyright 2024. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;

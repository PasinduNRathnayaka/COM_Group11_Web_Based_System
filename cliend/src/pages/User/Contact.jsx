// src/pages/User/Contact.jsx
import React from 'react';

const Contact = () => {
  return (
    <div className="bg-white py-10 px-4 md:px-20">
      <h1 className="text-2xl font-bold text-center mb-10 text-blue-900">Contact us for all your questions and opinions</h1>

      {/* Contact Form */}
      <div className="grid md:grid-cols-2 gap-10">
        <form className="bg-gray-100 rounded-lg p-6 shadow-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="First Name" className="p-3 border rounded" required />
            <input type="text" placeholder="Last Name" className="p-3 border rounded" required />
          </div>
          <input type="email" placeholder="Email Address" className="p-3 w-full border rounded" required />
          <input type="text" placeholder="Subject" className="p-3 w-full border rounded" required />
          <textarea rows="5" placeholder="Message" className="p-3 w-full border rounded" required />
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dull">
            Send Message
          </button>
        </form>

        {/* Image (or contact info) */}
        <div className="rounded-lg overflow-hidden">
          <img
            src="https://img.freepik.com/free-photo/hands-typing-laptop_1098-19259.jpg"
            alt="Contact Us"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Google Map */}
      <div className="mt-10">
        <iframe
          title="Kamal Auto Parts Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63317.39405935737!2d80.51600484031252!3d5.948351038750421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae140f6a3ac2f11%3A0x6f2cb7a2c2a75d83!2sMatara!5e0!3m2!1sen!2slk!4v1621781714811!5m2!1sen!2slk"
          width="100%"
          height="350"
          allowFullScreen=""
          loading="lazy"
          className="rounded-lg shadow"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;

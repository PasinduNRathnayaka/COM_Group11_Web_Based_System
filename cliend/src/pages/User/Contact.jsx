import React, { useState } from 'react';
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

  const [loading, setLoading] = useState(false);

  if (!user) return <Navigate to="/" replace />;

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
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error(result.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 🔷 Top Blue Section with Contact Info */}
      <div className="bg-blue-500 text-white py-10 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 rounded-b-2xl">
        <h1 className="text-3xl font-bold mb-2">KAMAL AUTO PARTS</h1>
        <p className="mb-6 text-sm md:text-base">We’d love to hear from you. Let’s get in touch.</p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-semibold">📍 Address</p>
            <p>No 128, Wewurukannala Road, Kekanadura, Sri Lanka</p>
          </div>
          <div>
            <p className="font-semibold">📞 Phone</p>
            <p>+94 0777 555 919</p>
          </div>
          <div>
            <p className="font-semibold">📧 Email</p>
            <p>kamalautoparts@gmail.com</p>
          </div>
        </div>
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
                  className="p-3 border rounded w-full"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="p-3 border rounded w-full"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="p-3 border rounded w-full"
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="p-3 border rounded w-full"
              />
              <textarea
                name="message"
                placeholder="Message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className="p-3 border rounded w-full"
              ></textarea>
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dull"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
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
          <iframe
            title="Kamal Auto Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63317.39405935737!2d80.51600484031252!3d5.948351038750421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae140f6a3ac2f11%3A0x6f2cb7a2c2a75d83!2sMatara!5e0!3m2!1sen!2slk!4v1621781714811!5m2!1sen!2slk"
            width="100%"
            height="350"
            allowFullScreen=""
            loading="lazy"
            className="rounded-lg shadow"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;

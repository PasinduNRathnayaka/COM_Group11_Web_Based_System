// src/pages/User/Profile.jsx
import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { FaUser, FaClipboardList, FaLock } from "react-icons/fa";

const Profile = () => {
  const { user } = useAppContext();

  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ")[1] || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSave = () => {
    // TODO: Add save logic
    alert("Details saved!");
  };

  return (
    <div className="p-6 md:p-12 flex flex-col md:flex-row gap-10 max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 border rounded-xl shadow p-4">
        <div className="flex flex-col items-center gap-2 mb-6">
          <img
            src={user?.profilePic || "https://via.placeholder.com/100"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          <h2 className="font-semibold">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <div className="space-y-2">
          <button className="flex items-center w-full gap-2 px-3 py-2 bg-blue-600 text-white rounded">
            <FaUser /> Account Info
          </button>
          <button className="flex items-center w-full gap-2 px-3 py-2 border rounded hover:bg-gray-100">
            <FaClipboardList /> My order
          </button>
          <button className="flex items-center w-full gap-2 px-3 py-2 border rounded hover:bg-gray-100">
            <FaLock /> Change password
          </button>
        </div>
      </div>

      {/* Main Account Info Section */}
      <div className="flex-1 border rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Account Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-1 font-medium">First Name *</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Last Name *</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Email Address *</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Phone Number *</label>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          onClick={handleSave}
        >
          SAVE
        </button>
      </div>
    </div>
  );
};

export default Profile;


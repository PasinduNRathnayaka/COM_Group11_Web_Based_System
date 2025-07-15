import React, { useState } from "react";

const EditProfile = () => {
  const [name, setName] = useState("Dasun");
  const [bio, setBio] = useState(
    "A results-driven professional with a Bachelor’s Degree in Business Management..."
  );
  const [email, setEmail] = useState("dasun25@gmail.com");
  const [mobile, setMobile] = useState("0715454444555");
  const [image, setImage] = useState(
    "https://img.freepik.com/free-photo/young-businessman-standing-with-arms-crossed-white-background_114579-20876.jpg"
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile Updated!");
    // 🔄 Here you'd send data to backend or store
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-md">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">Home &gt; Profile &gt; Edit Profile</div>
        <h2 className="text-xl font-bold mb-6">Edit Profile</h2>

        {/* Form Layout */}
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
          {/* Left Side */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Contact</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Email"
                  required
                />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Mobile"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={image}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Profile picture</label>
              <div className="border border-dashed border-gray-400 rounded p-4 text-center">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Drop your image here, or browse. Jpeg, png are allowed
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="md:col-span-3 text-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              SAVE
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-gray-400">
          © 2025 - Employee Dashboard
        </footer>
      </div>
    </div>
  );
};

export default EditProfile;

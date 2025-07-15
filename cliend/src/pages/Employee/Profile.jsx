import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();

  const handleEditClick = () => {
    setIsEditing(true);
    // You can add modal logic here if needed
  };

   return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 relative">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-2">Home &gt; Profile</div>

        {/* Edit Button */}
        <button
          onClick={() => navigate("/employee/edit-profile")}
          className="absolute top-4 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm rounded"
        >
          Edit
        </button>
        {/* Greeting */}
        <h2 className="text-xl font-semibold mb-4">Hi Dasun,</h2>

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <img
            src="https://img.freepik.com/free-photo/young-businessman-standing-with-arms-crossed-white-background_114579-20876.jpg"
            alt="Dasun"
            className="w-48 h-48 rounded-full object-cover border-4 border-gray-300"
          />
        </div>

        {/* Bio Section */}
        <div className="mb-6">
          <h3 className="font-semibold mb-1">Bio,</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            “A results-driven professional with a Bachelor’s Degree in Business
            Management, complemented by certifications in Office Administration and
            Retail Operations. Demonstrates a proven track record in customer service
            excellence, inventory oversight, and team collaboration. Known for a strong
            work ethic, adaptability, and a commitment to operational efficiency.
            Fluent in English and Sinhala, with a passion for professional growth and
            adding measurable value to the organization’s success.”
          </p>
        </div>

        {/* Contact Section */}
        <div className="text-sm space-y-2">
          <h3 className="font-semibold mb-1">Contact-</h3>
          <p>
            <span className="font-semibold">Email = </span>
            <a href="mailto:dasun25@gmail.com" className="text-blue-600 underline">
              dasun25@gmail.com
            </a>
          </p>
          <p>
            <span className="font-semibold">Mobile = </span>0715454444555
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-gray-500">
          © 2025 - Employee Dashboard
        </footer>
      </div>
    </div>
  );
};

export default EmployeeProfile;

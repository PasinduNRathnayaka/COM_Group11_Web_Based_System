import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const SidebarLayout = () => {
  return (
    <div className="flex h-screen bg-blue-50">
      {/* Sidebar */}
      <div className="w-64 bg-blue-100 p-4 space-y-4">
        <div className="text-xl font-bold mb-6">KAMAL</div>
        <nav className="flex flex-col space-y-2 text-sm">
          <NavLink to="/profile" className="hover:underline">Profile</NavLink>
          <div>
            <div className="font-semibold">Attendance</div>
            <NavLink to="/attendance" className="ml-4 block">View Attendance</NavLink>
          </div>
          <div>
            <div className="font-semibold">Salary</div>
            <NavLink to="/salary" className="ml-4 block">Check Payment</NavLink>
          </div>
          <NavLink to="/leave" className="hover:underline">Apply For Leave</NavLink>
          <NavLink to="/download-id" className="hover:underline">Download ID</NavLink>
          <NavLink to="/replies" className="hover:underline">Customer Replies</NavLink>
          <div>
            <div className="font-semibold">Order List</div>
            <NavLink to="/order-details" className="ml-4 block">Order Details</NavLink>
          </div>
          <button className="mt-6 bg-blue-600 text-white px-3 py-1 rounded">BACK</button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto bg-white">
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;

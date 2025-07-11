import React from "react";

const EmployeeTopNavbar = () => {
  return (
    <header className="bg-[#0f2c96] text-white px-6 py-3 flex justify-between items-center shadow">
      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Kamal Logo"
          className="h-10 w-10 object-contain"
        />
        <span className="text-xl font-bold tracking-wide">Kamal Auto Parts</span>
      </div>
    </header>
  );
};

export default EmployeeTopNavbar;

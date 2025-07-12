import React from "react";

export const Button = ({ children, className = "", variant = "solid", ...props }) => {
  const base =
    variant === "outline"
      ? "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button className={`px-4 py-2 rounded ${base} ${className}`} {...props}>
      {children}
    </button>
  );
};

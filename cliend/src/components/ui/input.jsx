import React from "react";

export const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full border border-gray-300 rounded px-3 py-2 ${className}`}
    {...props}
  />
);

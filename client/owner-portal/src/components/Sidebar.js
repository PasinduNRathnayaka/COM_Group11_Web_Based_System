import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Owner Panel</h2>
      <nav>
        <ul>
          <li><Link to="/add-product">Add Product</Link></li>
          <li><Link to="/products">Product List</Link></li>
          <li><Link to="/add-employee">Add Employee</Link></li>
          <li><Link to="/employees">Employee List</Link></li>
          <li><Link to="/attendance">Mark Attendance</Link></li>
          <li><Link to="/salary-sheet">View Salary Sheet</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;

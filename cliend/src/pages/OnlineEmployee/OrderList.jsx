import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const orders = new Array(10).fill({
  product: "Lorem Ipsum",
  orderId: "#25426",
  date: "Nov 8th, 2023",
  customer: "Kavin",
  status: "Delivered",
  amount: "Rs:200.00",
});

const OrderList = () => {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-2">Recent Purchases</h2>
      <table className="w-full text-sm table-auto border-separate border-spacing-y-2">
        <thead className="text-left text-gray-600">
          <tr>
            <th><input type="checkbox" /></th>
            <th>Product</th>
            <th>Order ID</th>
            <th>Date</th>
            <th>Customer Name</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((item, index) => (
            <tr key={index} className="bg-gray-50">
              <td><input type="checkbox" /></td>
              <td>{item.product}</td>
              <td>{item.orderId}</td>
              <td>{item.date}</td>
              <td className="flex items-center space-x-2">
                <img src="/avatar.png" alt="avatar" className="w-6 h-6 rounded-full" />
                <span>{item.customer}</span>
              </td>
              <td>
                <span className="flex items-center text-blue-600">
                  <FaCheckCircle className="mr-1" /> {item.status}
                </span>
              </td>
              <td>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, "...", 10].map((pg, i) => (
            <button key={i} className={`px-2 py-1 rounded ${pg === 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>
              {pg}
            </button>
          ))}
          <button className="bg-gray-300 px-2 py-1 rounded">Next</button>
        </div>
      </div>
    </div>
  );
};

export default OrderList;

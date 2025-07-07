import React from "react";

const orders = Array(10).fill({
  product: "Lorem Ipsum",
  orderId: "#25426",
  date: "Nov 8th, 2023",
  customer: "Kevin",
  avatar: "/avatar.png", // Replace with actual image
  status: "Delivered",
  amount: "Rs:200.00",
});

const OrderListPage = () => {
  return (
    <div className="bg-[#f3f3f3] min-h-screen p-6">
      {/* Title */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold">Orders List</h2>
          <p className="text-sm text-gray-500">Home &gt; Order List</p>
        </div>
        {/* Date Filter */}
        <div className="text-sm text-gray-700 flex items-center gap-2">
          <span className="material-icons text-lg">calendar_today</span>
          <span>Feb 16, 2025 - Feb 20, 2025</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Purchases</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm text-left">
            <thead className="border-b font-semibold text-gray-600">
              <tr>
                <th className="py-2">
                  <input type="checkbox" />
                </th>
                <th className="py-2">Product</th>
                <th className="py-2">Order ID</th>
                <th className="py-2">Date</th>
                <th className="py-2">Customer Name</th>
                <th className="py-2">Status</th>
                <th className="py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2">
                    <input type="checkbox" />
                  </td>
                  <td className="py-2">{order.product}</td>
                  <td className="py-2">{order.orderId}</td>
                  <td className="py-2">{order.date}</td>
                  <td className="py-2 flex items-center gap-2">
                    <img
                      src={order.avatar}
                      alt="avatar"
                      className="w-6 h-6 rounded-full"
                    />
                    {order.customer}
                  </td>
                  <td className="py-2 text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    {order.status}
                  </td>
                  <td className="py-2">{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className={`w-8 h-8 rounded text-sm ${
                  n === 1
                    ? "bg-black text-white"
                    : "border border-gray-300 bg-white"
                }`}
              >
                {n}
              </button>
            ))}
            <span className="px-2">...</span>
            <button className="w-8 h-8 rounded border border-gray-300">
              10
            </button>
            <button className="w-8 h-8 rounded border border-gray-300">
              Next &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-xs flex justify-between text-gray-500">
        <span>© 2025 - Admin Dashboard</span>
        <div className="flex gap-4">
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default OrderListPage;

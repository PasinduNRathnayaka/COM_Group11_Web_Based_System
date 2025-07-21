import React, { useEffect, useState } from "react";
import axios from "axios";



const OrderList = () => {
  //new
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/orders?page=${page}`)
      .then((res) => {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => console.error(err));
  }, [page]);
  //new

  return (

  <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Order List</h2>
      <p className="text-sm text-gray-500 mb-6">Home &gt; Order List</p>
      
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-2">Recent Purchases</h2>
      <table className="w-full text-sm table-auto border-separate border-spacing-y-2">
        <thead className="text-left text-gray-600">
          <tr>
             <th className="p-2">Product</th>
            <th className="p-2">Order ID</th>
            <th className="p-2">Date</th>
            <th className="p-2">Customer Name</th>
            <th className="p-2">Status</th>
            <th className="p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={i} className="text-center">
              <td className="p-2">{o.product}</td>
              <td className="p-2">{o.orderId}</td>
              <td className="p-2">{new Date(o.date).toDateString()}</td>
              <td className="p-2">{o.customerName}</td>
              <td className="p-2 text-blue-600">{o.status}</td>
              <td className="p-2">Rs:{o.amount.toFixed(2)}</td>
            </tr>
            //new
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

    
      <footer className="mt-8 text-center text-sm text-gray-400">
        © 2025 · OnlineEmployee Dashboard
      </footer>
    
    </div>
    
  );
};

export default OrderList;

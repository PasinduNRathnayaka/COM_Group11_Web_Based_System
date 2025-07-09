import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const summaryCards = [
  { title: "Total Sales", value: "Rs:126.500", change: "+34.7%" },
  { title: "Active Orders", value: "Rs:126.500", change: "This month" },
  { title: "Completed Orders", value: "Rs:126.500", change: "This month" },
  { title: "Employee Fees", value: "Rs:126.500", change: "This month" },
];

const salesData = [
  { month: "Jul", sales: 20 },
  { month: "Aug", sales: 25 },
  { month: "Sep", sales: 30 },
  { month: "Oct", sales: 60 },
  { month: "Nov", sales: 80 },
  { month: "Dec", sales: 340 },
];

const bestSellers = [
  { id: 1, name: "Lorem Ipsum", price: "Rs:126.50", sales: 999 },
  { id: 2, name: "Lorem Ipsum", price: "Rs:126.50", sales: 999 },
  { id: 3, name: "Lorem Ipsum", price: "Rs:126.50", sales: 999 },
];

const attendanceRows = [
  { id: 1, empNo: "001", name: "John Doe", date: "2025‑07‑06", in: "09:00", out: "17:00" },
  { id: 2, empNo: "002", name: "Jane Smith", date: "2025‑07‑06", in: "09:15", out: "17:10" },
  { id: 3, empNo: "003", name: "Bob Lee", date: "2025‑07‑06", in: "08:50", out: "16:55" },
];

const SummaryCard = ({ title, value, change }) => (
  <div className="flex-1 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow p-4">
    <p className="text-gray-600 text-sm mb-2">{title}</p>
    <h3 className="text-xl font-bold">{value}</h3>
    <p className="text-xs text-green-600 mt-1">{change}</p>
  </div>
);

const SalesGraph = () => (
  <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow p-4 min-w-[420px]">
    <div className="flex justify-between items-center mb-2">
      <h4 className="font-semibold">Sale Graph</h4>
      <div className="space-x-2 text-sm">
        {"Weekly Monthly Yearly".split(" ").map((label) => (
          <button
            key={label}
            className="px-2 py-1 border rounded hover:bg-gray-100"
          >
            {label.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={salesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="sales" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const BestSellers = () => (
  <div className="w-64 bg-white border border-gray-200 rounded-lg shadow p-4">
    <h4 className="font-semibold mb-4">Best Sellers Items</h4>
    <ul className="space-y-3 text-sm">
      {bestSellers.map((item) => (
        <li key={item.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded" />
            <span>{item.name}</span>
          </div>
          <div className="text-right">
            <p className="font-bold">{item.price}</p>
            <p className="text-xs text-gray-500">{item.sales} sales</p>
          </div>
        </li>
      ))}
    </ul>
    <button className="mt-4 w-full py-1.5 text-xs bg-blue-600 text-white rounded">REPORT</button>
  </div>
);

const AttendanceTable = () => (
  <div className="bg-white border border-gray-200 rounded-lg shadow p-4 overflow-x-auto">
    <h4 className="font-semibold mb-2">Attendance List</h4>
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-50">
          {["Employee Number", "Employee Name", "Date", "Check In", "Check Out", "Details"].map((head) => (
            <th key={head} className="px-3 py-2 border-b text-left">
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {attendanceRows.map((row) => (
          <tr key={row.id} className="hover:bg-gray-50">
            <td className="px-3 py-2 border-b">{row.empNo}</td>
            <td className="px-3 py-2 border-b">{row.name}</td>
            <td className="px-3 py-2 border-b">{row.date}</td>
            <td className="px-3 py-2 border-b">{row.in}</td>
            <td className="px-3 py-2 border-b">{row.out}</td>
            <td className="px-3 py-2 border-b">
              <button className="px-4 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">View</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-100 p-6 space-y-6 overflow-y-auto">
      {/* Summary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </section>

      {/* Sales graph & best sellers */}
      <section className="flex flex-wrap gap-4">
        <SalesGraph />
        <BestSellers />
      </section>

      {/* Attendance table */}
      <section>
        <AttendanceTable />
      </section>
      
    </div>
  );
};

export default Dashboard;

import React from "react";
import { FiX } from "react-icons/fi";

const notifications = [
  { id: 1, title: "Lorem Ipsum", amount: "Rs:140", date: "Nov 15, 2025" },
  { id: 2, title: "Lorem Ipsum", amount: "Rs:140", date: "Nov 15, 2025" },
  { id: 3, title: "Lorem Ipsum", amount: "Rs:140", date: "Nov 15, 2025" },
  { id: 4, title: "Lorem Ipsum", amount: "Rs:140", date: "Nov 15, 2025" },
];

const NotificationPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 w-80 bg-white shadow-lg rounded-md p-4 z-50">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">Notifications</h2>
        <button onClick={onClose}>
          <FiX />
        </button>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {notifications.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border rounded p-2">
            <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
            <div className="flex-1">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-gray-600">{item.amount}</p>
              <p className="text-xs text-gray-500">{item.date}</p>
            </div>
            <div className="text-xs bg-blue-900 text-white px-2 py-1 rounded">Sold</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between items-center text-sm">
        <label>
          <input type="checkbox" className="mr-1" />
          Mark all as read
        </label>
        <button className="bg-blue-900 text-white px-3 py-1 rounded">
          View All Notification
        </button>
      </div>
    </div>
  );
};

export default NotificationPopup;

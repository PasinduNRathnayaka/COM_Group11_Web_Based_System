import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const ApplyLeave = () => {
  const [stats, setStats] = useState({ leaveDays: 0, workedDays: 0, halfDays: 0 });
  const [announcements, setAnnouncements] = useState([]);

  const [leaveType, setLeaveType] = useState("full");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [applyTo, setApplyTo] = useState("Owner");
  const [reason, setReason] = useState("");
  const [noOfDays, setNoOfDays] = useState("");

  // Fetch stats and announcements
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, announceRes] = await Promise.all([
          axios.get("/api/employee/leave-stats"),
          axios.get("/api/employee/announcements"),
        ]);
        setStats(statsRes.data);
        setAnnouncements(announceRes.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  const handleApplyLeave = async () => {
    try {
      const payload = {
        type: leaveType,
        from: fromDate,
        to: toDate,
        applyTo,
        reason,
        days: noOfDays,
      };
      await axios.post("/api/employee/apply-leave", payload);
      alert("Leave applied successfully!");
    } catch (error) {
      alert("Error applying leave.");
    }
  };

  const handleCancel = () => {
    setFromDate("");
    setToDate("");
    setApplyTo("Owner");
    setReason("");
    setNoOfDays("");
    setLeaveType("full");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-1">Apply for leave</h2>
      <p className="text-sm text-gray-500 mb-6">Home &gt; Apply for leave</p>

      {/* Stat Boxes */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow p-4 rounded text-center">
          <p className="text-3xl text-green-600 font-bold">{stats.leaveDays}</p>
          <p className="text-gray-600">Leave Days</p>
        </div>
        <div className="bg-white shadow p-4 rounded text-center">
          <p className="text-3xl text-green-600 font-bold">{stats.workedDays}</p>
          <p className="text-gray-600">Worked Days</p>
        </div>
        <div className="bg-white shadow p-4 rounded text-center">
          <p className="text-3xl text-green-600 font-bold">{stats.halfDays}</p>
          <p className="text-gray-600">Half Days</p>
        </div>
      </div>

      {/* Apply Form */}
      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto mb-10">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Apply Leave</h3>

        <div className="flex items-center gap-4 mb-4">
          <label>
            <input
              type="radio"
              checked={leaveType === "full"}
              onChange={() => setLeaveType("full")}
            />
            <span className="ml-2">Full Day</span>
          </label>
          <label>
            <input
              type="radio"
              checked={leaveType === "half"}
              onChange={() => setLeaveType("half")}
            />
            <span className="ml-2">Half Day</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 text-sm">From</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">To</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">No of Days</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={noOfDays}
            onChange={(e) => setNoOfDays(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Apply to</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={applyTo}
            onChange={(e) => setApplyTo(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Reason</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyLeave}
            className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white shadow-md p-4 rounded max-w-2xl mx-auto">
        <h4 className="font-semibold text-lg mb-2">Announcements</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          {announcements.map((a, index) => (
            <li key={index}>{a.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ApplyLeave;

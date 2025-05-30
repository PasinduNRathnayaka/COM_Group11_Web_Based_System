// File: App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
      </div>
    </Router>
  );
}

export default App;

// src/pages/DashboardPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Dashboard from "../components/Dashboard";

function DashboardPage() {
  const navigate = useNavigate(); // Initialize navigate hook

  // Handler for clicking the Low Stock Alerts card
  const handleLowStockClick = () => {
    navigate("/inventory?filter=low-stock"); // Navigate with a URL parameter for low stock
  };

  // NEW: Handler for clicking the Total Items card
  const handleTotalItemsClick = () => {
    navigate("/inventory?filter=all"); // Navigate with a URL parameter for all items
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Overview & Analytics
      </h2>
      {/* Dashboard component now receives both click handlers */}
      <Dashboard
        onLowStockClick={handleLowStockClick}
        onTotalItemsClick={handleTotalItemsClick}
      />
    </div>
  );
}

export default DashboardPage;

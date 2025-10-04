// src/pages/InventoryPage.jsx
import React from "react";
import StockList from "../components/StockList";

function InventoryPage() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
      <StockList />
    </div>
  );
}

export default InventoryPage;

// src/components/StatCard.jsx
import React from "react";

function StatCard({ title, value, icon, bgColor, textColor }) {
  return (
    <div
      className={`p-6 rounded-lg shadow-md flex items-center justify-between ${bgColor} ${textColor}`}
    >
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="text-4xl opacity-75">{icon}</div>
    </div>
  );
}

export default StatCard;

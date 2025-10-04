import React from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, deleteDoc } from "firebase/firestore";
import { getCategoryIcon, formatCurrency } from "../utils/constants";

function StockItemCard({ item, onEdit, onDelete }) {
  const isLowStock = item.quantity <= item.minStock;

  // Format the createdAt timestamp to dd-mm-yyyy hh:mm
  const formattedCreateDate = item.createdAt
    ? (() => {
        const date = new Date(item.createdAt.toDate());
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} ${hours}:${minutes}`;
      })()
    : "N/A"; // Fallback if createdAt is not available

  return (
    <div
      className={`bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out ${
        isLowStock ? "border-red-400 ring-1 ring-red-400" : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          {getCategoryIcon(item.category)}{" "}
          <span className="ml-2">{item.name}</span>
        </h3>
        {isLowStock && (
          <span className="text-red-500 text-sm font-semibold flex items-center">
            <svg
              className="w-5 h-5 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.487 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
            Low Stock!
          </span>
        )}
      </div>

      <div className="space-y-2 text-gray-700 mb-4">
        <p>
          <strong className="font-semibold">Category:</strong> {item.category}
        </p>
        <p>
          <strong className="font-semibold">Quantity:</strong>{" "}
          <span className={`${isLowStock ? "text-red-600 font-bold" : ""}`}>
            {item.quantity}
          </span>{" "}
          (Min: {item.minStock})
        </p>
        <p>
          <strong className="font-semibold">Price:</strong>{" "}
          {formatCurrency(item.price)}
        </p>
        {item.supplier && (
          <p>
            <strong className="font-semibold">Supplier:</strong> {item.supplier}
          </p>
        )}
        {/* Display the Creation Date here in dd-mm-yyyy hh:mm format */}
        <p className="text-[12px] italic">
          <strong className="font-semibold">Created On:</strong>{" "}
          {formattedCreateDate}
        </p>
        {item.description && (
          <p className="text-sm italic">{item.description}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onEdit(item)}
          className="cursor-pointer px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item.id, item.name)}
          className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default StockItemCard;

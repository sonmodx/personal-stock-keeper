// src/components/DeleteConfirmModal.jsx
import React from "react";

function DeleteConfirmModal({ isOpen, onClose, itemName, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(17,24,39,0.8)] flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 relative transform scale-100 animate-slide-up-fade">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Confirm Deletion
        </h3>
        <p className="text-gray-700 mb-6 text-center">
          Are you sure you want to delete "
          <strong className="text-red-600">{itemName}</strong>"? This action
          cannot be undone.
        </p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="cursor-pointer px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer px-5 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;

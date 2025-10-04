// src/components/AddMemoryModal.jsx
import React, { useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "./ToastProvider";
import { auth } from "../firebase/firebaseConfig";
import { MAPPING_BTN_COLORS_CLASSES } from "../utils/constants";

function AddMemoryModal({ isOpen, onClose, btnColor = "green" }) {
  const elementColor = btnColor;

  const colorMap = MAPPING_BTN_COLORS_CLASSES;
  const colorBundelSet = colorMap[elementColor] || colorMap["green"];
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim()) {
      setError("Memory Name is required.");
      setLoading(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("User not authenticated.");
      showToast("You must be logged in to add a memory.", "error");
      setLoading(false);
      return;
    }

    try {
      const userMemoriesRef = collection(db, "users", user.uid, "memories");

      await addDoc(userMemoriesRef, {
        name: name.trim(),
        description: description.trim(),
        createdAt: serverTimestamp(),
      });

      showToast("Memory added successfully! 🎉", "success");
      onClose();
      setName("");
      setDescription("");
    } catch (err) {
      console.error("Error adding memory: ", err);
      setError(`Failed to add memory: ${err.message}`);
      showToast(`Failed to add memory: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(17,24,39,0.8)] flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 md:p-8 relative transform scale-100 animate-slide-up-fade opacity-100!">
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-3xl font-bold transition-colors duration-200"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Add New Memory
        </h2>

        {error && (
          <p className="text-red-600 bg-red-100 border border-red-300 rounded-md p-3 mb-4 text-center text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="memoryName"
              className="block text-sm font-medium text-gray-700"
            >
              Memory Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="memoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Disney Trip"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="A brief description of this memory."
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            ></textarea>
          </div>

          <button
            type="submit"
            className={`${colorBundelSet} cursor-pointer w-full py-3 px-4  text-white font-semibold rounded-md  focus:outline-none focus:ring-2  focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
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
              "Add Memory"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMemoryModal;

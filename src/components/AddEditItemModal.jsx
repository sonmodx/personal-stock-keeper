// src/components/AddEditItemModal.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "../firebase/firebaseConfig";
import { CATEGORIES, MAPPING_BTN_COLORS_CLASSES } from "../utils/constants";
import { useToast } from "./ToastProvider"; // Import the useToast hook
import { useSearchParams } from "react-router-dom";

function AddEditItemModal({
  isOpen,
  onClose,
  itemToEdit,
  btnColor = "yellow",
}) {
  const elementColor = btnColor;
  const [searchParams, setSearchParams] = useSearchParams();

  const colorMap = MAPPING_BTN_COLORS_CLASSES;
  const colorBundelSet = colorMap[elementColor] || colorMap["yellow"];
  //const colorBundelSet = `bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500`;
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState(
    searchParams.get("category") ?? CATEGORIES[0]
  );

  const [quantity, setQuantity] = useState("");
  const [minStock, setMinStock] = useState("");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(""); // Renamed from 'error' to avoid confusion with alert error

  const { showToast } = useToast(); // Use the toast hook

  useEffect(() => {
    if (itemToEdit) {
      setItemName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setQuantity(itemToEdit.quantity);
      setMinStock(itemToEdit.minStock);
      setPrice(itemToEdit.price);
      setSupplier(itemToEdit.supplier || "");
      setDescription(itemToEdit.description || "");
    } else {
      setItemName("");
      setCategory(searchParams.get("category") ?? CATEGORIES[0]);
      setQuantity("");
      setMinStock("");
      setPrice("");
      setSupplier("");
      setDescription("");
    }
    setFormError(""); // Clear form validation errors
  }, [itemToEdit, isOpen]);

  useEffect(() => {
    const categoryParam = searchParams.get("category"); // Get category from URL

    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      // If category param exists and is valid
      setCategory(categoryParam); // Set selected category from URL
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    if (!itemName.trim()) {
      setFormError("Item Name is required.");
      setLoading(false);
      return;
    }
    if (quantity === "" || minStock === "" || price === "") {
      setFormError("Quantity, Minimum Stock, and Price are required.");
      setLoading(false);
      return;
    }
    if (
      isNaN(quantity) ||
      isNaN(minStock) ||
      isNaN(price) ||
      parseInt(quantity) < 0 ||
      parseInt(minStock) < 0 ||
      parseFloat(price) < 0
    ) {
      setFormError(
        "Quantity, Minimum Stock, and Price must be valid non-negative numbers."
      );
      setLoading(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showToast("User not authenticated", "error");
      setLoading(false);
      return;
    }

    const itemData = {
      name: itemName.trim(),
      category,
      quantity: parseInt(quantity),
      minStock: parseInt(minStock),
      price: parseFloat(price),
      supplier: supplier.trim(),
      description: description.trim(),
    };

    const userInventoryRef = collection(db, "users", user.uid, "inventory");

    try {
      if (itemToEdit) {
        const itemDocRef = doc(
          db,
          "users",
          user.uid,
          "inventory",
          itemToEdit.id
        );
        await updateDoc(itemDocRef, {
          ...itemData,
          updatedAt: serverTimestamp(),
        });
        showToast("Item updated successfully! 🎉", "success");
      } else {
        await addDoc(userInventoryRef, {
          ...itemData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast("Item added successfully! ✨", "success");
      }
      onClose();
    } catch (err) {
      console.error("Error saving document: ", err);
      const errorMessage = `Failed to save item: ${err.message}`;
      setFormError(errorMessage);
      showToast(errorMessage, "error");
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
          {itemToEdit ? "Edit Stock Item" : "Add New Stock Item"}
        </h2>

        {formError && ( // Use formError for in-modal validation messages
          <p className="text-red-600 bg-red-100 border border-red-300 rounded-md p-3 mb-4 text-center text-sm">
            {formError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="itemName"
              className="block text-sm font-medium text-gray-700"
            >
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Apple iPhone 15"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              required
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white transition duration-150"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700"
              >
                Current Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                required
                min="0"
              />
            </div>
            <div>
              <label
                htmlFor="minStock"
                className="block text-sm font-medium text-gray-700"
              >
                Minimum Stock Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="minStock"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="10"
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price per unit <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label
              htmlFor="supplier"
              className="block text-sm font-medium text-gray-700"
            >
              Supplier (Optional)
            </label>
            <input
              type="text"
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g., Tech Distributor Inc."
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
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
              placeholder="Add a detailed description of the item."
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            ></textarea>
          </div>

          <button
            type="submit"
            className={`${colorBundelSet} cursor-pointer w-full py-3 px-4  text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
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
            ) : itemToEdit ? (
              "Update Item"
            ) : (
              "Add Item"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEditItemModal;

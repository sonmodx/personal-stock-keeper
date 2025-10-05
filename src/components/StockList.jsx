// src/components/StockList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom"; // Keep useSearchParams
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import StockItemCard from "./StockItemCard";
import AddEditItemModal from "./AddEditItemModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import {
  CATEGORIES,
  MAPPING_BTN_COLORS_CLASSES,
  MAPPING_FOCUS_RING_COLORS_CLASSES,
} from "../utils/constants";
import { auth } from "../firebase/firebaseConfig";
import CategorySelect from "./CategorySelect";
import { useGlobal } from "../context/GlobalContext";

function StockList() {
  const { globalValue } = useGlobal();
  const elementColor = globalValue.inventoryColor || "yellow";

  const colorMap = MAPPING_BTN_COLORS_CLASSES;
  const focusRingColorMap = MAPPING_FOCUS_RING_COLORS_CLASSES;
  const colorBundelSet = colorMap[elementColor] || colorMap["yellow"];
  const colorFocusRingBundelSet =
    focusRingColorMap[elementColor] || focusRingColorMap["yellow"];
  const [allStockItems, setAllStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All"); // Initial state 'All'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // Effect to read URL parameters and set state
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    const categoryParam = searchParams.get("category"); // Get category from URL

    if (filterParam === "low-stock") {
      setSearchTerm("");
      setSelectedCategory("All"); // Low stock filter doesn't imply a category filter
    } else if (filterParam === "all") {
      setSearchTerm("");
      setSelectedCategory("All");
    } else if (categoryParam && CATEGORIES.includes(categoryParam)) {
      // If category param exists and is valid
      setSelectedCategory(categoryParam); // Set selected category from URL
      setSearchTerm(""); // Clear search term when category filter is applied via URL
    } else {
      // Default to 'All' if no valid filter or category param
      setSelectedCategory("All");
    }
    // Note: setSearchParams is not used here to prevent infinite loops,
    // as we are reading from the URL, not writing to it based on local state.
  }, [searchParams]); // Rerun when URL search params change

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "inventory"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllStockItems(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching stock items: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredStockItems = useMemo(() => {
    let filtered = allStockItems;
    const filterParam = searchParams.get("filter"); // Get filter from URL
    const categoryParam = searchParams.get("category"); // Get category from URL

    // Apply URL-based category filter first if present
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      filtered = filtered.filter((item) => item.category === categoryParam);
    } else if (selectedCategory !== "All") {
      // Apply dropdown-based category filter if no URL param
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (filterParam === "low-stock") {
      filtered = filtered.filter((item) => item.quantity <= item.minStock);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.category.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.supplier?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return filtered;
  }, [allStockItems, searchTerm, selectedCategory, searchParams]); // Add searchParams to dependencies

  const handleAddItemClick = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id, name) => {
    setItemToDelete({ id, name });
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      await deleteDoc(
        doc(db, "users", auth.currentUser.uid, "inventory", itemToDelete.id)
      );

      console.log(`Item with ID: ${itemToDelete.id} deleted successfully.`);
      setIsDeleteConfirmModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Failed to delete item. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Handler for dropdown change - this will also update URL if needed
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    // Update URL to reflect selected category, clearing other filters
    setSearchParams(newCategory === "All" ? {} : { category: newCategory });
    setSearchTerm(""); // Clear search term when category changes
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <dotlottie-wc
          src="https://lottie.host/b33e9fc3-d89e-4d41-b9e4-3a57ef3cd717/Hn48ziTxSw.lottie"
          style={{ width: "100%", height: "auto" }}
          autoplay
          loop
        ></dotlottie-wc>
      </div>

      // <div className="text-center py-8 text-gray-600">Loading Stock...</div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-4 lg:space-y-0 lg:space-x-4">
        <h2 className="text-2xl font-bold text-gray-800">Inventory List</h2>
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 w-full lg:w-auto">
          <input
            type="text"
            placeholder="Search by name, category, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`transition duration-200 focus:ring-2 ${colorFocusRingBundelSet} p-3 border border-gray-300 rounded-md focus:outline-none  w-full lg:w-80`}
          />
          {/* <select
            value={selectedCategory} // Controlled by state
            onChange={handleCategoryChange} // Use the new handler
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-48"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select> */}
          <CategorySelect
            CATEGORIES={CATEGORIES}
            selectedCategory={selectedCategory}
            handleCategoryChange={handleCategoryChange}
            color={elementColor}
          />
          <button
            onClick={handleAddItemClick}
            className={`${colorBundelSet} cursor-pointer text-sm flex items-center justify-center px-6 py-3  text-white font-semibold rounded-md  focus:outline-none focus:ring-2  focus:ring-offset-2 transition duration-200 ease-in-out w-full lg:w-auto`}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Add New Item
          </button>
        </div>
      </div>

      {filteredStockItems.length === 0 ? (
        <p className="text-gray-600 text-center text-lg py-10">
          {searchTerm ||
          selectedCategory !== "All" ||
          searchParams.get("filter")
            ? "No items match your current filters."
            : 'No stock items found. Click "Add New Item" to get started!'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStockItems.map((item) => (
            <StockItemCard
              key={item.id}
              item={item}
              onEdit={handleEditItem}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      <AddEditItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemToEdit={itemToEdit}
        btnColor={elementColor}
      />

      <DeleteConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => {
          setIsDeleteConfirmModalOpen(false);
          setItemToDelete(null);
        }}
        itemName={itemToDelete?.name || ""}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
}

export default StockList;

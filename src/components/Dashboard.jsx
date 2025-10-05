// src/components/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import StatCard from "./StatCard";
import {
  formatCurrency,
  CATEGORIES,
  getCategoryIcon,
} from "../utils/constants";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { auth } from "../firebase/firebaseConfig"; // to access current user
import background from "../assets/dashboard_bg.avif";

function Dashboard({ onLowStockClick, onTotalItemsClick }) {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const inventoryRef = collection(db, "users", user.uid, "inventory");
    const q = query(inventoryRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStockItems(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching dashboard data: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const totalItems = stockItems.length;
    const lowStockCount = stockItems.filter(
      (item) => item.quantity <= item.minStock
    ).length;
    const totalInventoryValue = stockItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const categoryItemCounts = CATEGORIES.reduce((acc, category) => {
      acc[category] = stockItems.filter(
        (item) => item.category === category
      ).length;
      return acc;
    }, {});
    const uniqueCategories = Object.keys(categoryItemCounts).filter(
      (cat) => categoryItemCounts[cat] > 0
    ).length;

    return {
      totalItems,
      lowStockCount,
      totalInventoryValue,
      uniqueCategories,
      categoryItemCounts,
    };
  }, [stockItems]);

  // New handler for clicking a category card
  const handleCategoryCardClick = (category) => {
    navigate(`/inventory?category=${category}`); // Navigate to inventory page with category filter
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
      // <div className="text-center py-8 text-gray-600">Loading Dashboard...</div>
    );
  }

  return (
    <div
      style={{ backgroundImage: `url(${background})` }}
      className="bg-no-repeat bg-center bg-cover rounded-lg px-4 py-8"
    >
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            onClick={onTotalItemsClick}
            className="cursor-pointer transition-transform duration-200 ease-in-out hover:scale-[1.02]"
          >
            <StatCard
              title="Total Items"
              value={stats.totalItems}
              icon="📦"
              bgColor="bg-blue-600"
              textColor="text-white"
            />
          </div>
          <div
            onClick={onLowStockClick}
            className="cursor-pointer transition-transform duration-200 ease-in-out hover:scale-[1.02]"
          >
            <StatCard
              title="Low Stock Alerts"
              value={stats.lowStockCount}
              icon="🚨"
              bgColor="bg-red-600"
              textColor="text-white"
            />
          </div>
          <StatCard
            title="Inventory Value"
            value={formatCurrency(stats.totalInventoryValue)}
            icon="💰"
            bgColor="bg-green-600"
            textColor="text-white"
          />
          <StatCard
            title="Unique Categories"
            value={stats.uniqueCategories}
            icon="🏷️"
            bgColor="bg-purple-600"
            textColor="text-white"
          />
        </div>

        <div className="bg-white/40 p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
            Browse by Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => (
              <div
                key={category}
                onClick={() => handleCategoryCardClick(category)} // Added onClick handler
                className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all duration-200 ease-in-out" // Added cursor-pointer
              >
                <div className="text-blue-600 text-3xl mb-2">
                  {getCategoryIcon(category)}
                </div>
                <span className="text-lg font-medium text-gray-800 text-center">
                  {category}
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  ({stats.categoryItemCounts[category] || 0} items)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

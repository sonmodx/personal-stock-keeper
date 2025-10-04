// src/utils/constants.js
export const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food",
  "Books",
  "Tools",
  "Other",
];

export const MAPPING_BTN_COLORS_CLASSES = {
  green: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  yellow: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
};

export const MAPPING_MENU_COLORS_CLASSES = {
  green: "text-white bg-green-600 px-3 py-2 rounded-md",
  blue: "text-white bg-blue-600 px-3 py-2 rounded-md",
  yellow: "text-white bg-yellow-600 px-3 py-2 rounded-md",
};

export const MAPPING_RING_COLORS_CLASSES = {
  green: "ring-2 ring-green-400 border-green-400 outline-none",
  blue: "ring-2 ring-blue-400 border-blue-400 outline-none",
  yellow: "ring-2 ring-yellow-400 border-yellow-400 outline-none",
};

export const MAPPING_FOCUS_RING_COLORS_CLASSES = {
  green: "focus:ring-green-500 outline-none",
  blue: "focus:ring-blue-500 outline-none",
  yellow: "focus:ring-yellow-500 outline-none",
};

export const MAPPING_MAIN_BACKGROUND_COLOR = {
  green: "bg-green-100",
  blue: "bg-blue-100",
  yellow: "bg-yellow-100",
  white: "bg-white-100",
  black: "bg-neutral-700",
};

// Simple icon mapping (you might use a dedicated icon library like react-icons/fa)
export const getCategoryIcon = (category) => {
  switch (category) {
    case "Electronics":
      return "⚡";
    case "Clothing":
      return "👕";
    case "Food":
      return "🍎";
    case "Books":
      return "📚";
    case "Tools":
      return "🛠️";
    default:
      return "📦";
  }
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB", // Or your local currency
  }).format(value);
};

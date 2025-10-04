import React, { useState, useRef } from "react";
import { AiOutlineDown } from "react-icons/ai";
import {
  MAPPING_FOCUS_RING_COLORS_CLASSES,
  MAPPING_RING_COLORS_CLASSES,
} from "../utils/constants";

function CategorySelect({
  CATEGORIES,
  selectedCategory,
  handleCategoryChange,
  color = "yellow",
}) {
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef(null);

  //   const color = "";
  const elementColor = color;

  const colorMap = MAPPING_FOCUS_RING_COLORS_CLASSES;
  const colorBundelSet = colorMap[elementColor] || colorMap["yellow"];

  return (
    <div className="flex relative w-full lg:w-48">
      <select
        ref={selectRef}
        value={selectedCategory}
        onChange={(e) => {
          handleCategoryChange(e);
          setIsFocused(false); // remove focus style after selection
          selectRef.current.blur(); // remove browser focus
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full p-3 pl-4 pr-10 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 text-sm
          transition duration-200 hover:shadow-md cursor-pointer appearance-none focus:ring-2  ${colorBundelSet}`}
      >
        <option value="All">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Custom Dropdown Icon */}
      <AiOutlineDown
        className="absolute top-1/2 right-10 -translate-y-1/2 text-gray-500 pointer-events-none"
        style={{ right: "1rem" }} // move it slightly left
      />
    </div>
  );
}

export default CategorySelect;

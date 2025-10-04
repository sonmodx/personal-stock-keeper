// src/context/GlobalContext.jsx
import React, { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const initValue = {
    dashboardColor: "blue",
    inventoryColor: "asd",
    memoryColor: "green",
  };
  const [globalValue, setGlobalValue] = useState(initValue);

  return (
    <GlobalContext.Provider value={{ globalValue, setGlobalValue }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook for easy usage
export const useGlobal = () => useContext(GlobalContext);

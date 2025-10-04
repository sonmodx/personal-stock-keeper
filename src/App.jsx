// src/App.jsx
import React from "react";
import { Routes, Route, useSearchParams, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import MemoryPage from "./pages/MemoryPage"; // Import the new MemoryPage
import { ToastProvider } from "./components/ToastProvider";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { GlobalProvider } from "./context/GlobalContext";
import { MAPPING_MAIN_BACKGROUND_COLOR } from "./utils/constants";

const mappingPathColor = {
  "/": "blue",
  "/inventory": "yellow",
  "/memories": "green",
  "/register": "black",
  "/login": "black",
};

function App() {
  const location = useLocation();
  const elementColor = mappingPathColor[location.pathname] || "white";
  const mainBgColorMap = MAPPING_MAIN_BACKGROUND_COLOR;
  const colorBundelSet =
    mainBgColorMap[elementColor] || mainBgColorMap["white"];

  return (
    <ToastProvider>
      <GlobalProvider>
        <div className={`font-sans  min-h-screen ${colorBundelSet}`}>
          <Navbar />
          <main className="container mx-auto p-8 py-24">
            {/* Added mt-4 for spacing below navbar */}
            <Routes>
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <PrivateRoute>
                    <InventoryPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/memories"
                element={
                  <PrivateRoute>
                    <MemoryPage />
                  </PrivateRoute>
                }
              />
              <Route path="/*" element={<div>404 Not found . . .</div>} />
              {/* New Route for Memories */}
            </Routes>
          </main>
        </div>
      </GlobalProvider>
    </ToastProvider>
  );
}

export default App;

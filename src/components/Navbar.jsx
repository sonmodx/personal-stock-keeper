import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import logo from "../assets/logo.png"; // Adjust the path as needed
import { useGlobal } from "../context/GlobalContext";
import { MAPPING_MENU_COLORS_CLASSES } from "../utils/constants";

function Navbar() {
  const { globalValue } = useGlobal();

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // ✅ Track current user

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const normalLinkClass =
    "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md";

  const colorMap = MAPPING_MENU_COLORS_CLASSES;

  const activeLinkClassByMenu = {
    dashboard: colorMap[globalValue.dashboardColor] || colorMap["blue"],
    inventory: colorMap[globalValue.inventoryColor] || colorMap["yellow"],
    memories: colorMap[globalValue.memoryColor] || colorMap["green"],
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 p-4 shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-between flex-wrap">
        {/* Logo */}
        <NavLink
          to="/"
          className="text-2xl font-bold text-white mr-6 flex items-center gap-2"
          onClick={closeMenu}
        >
          <span>StockPilot</span>
          <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
        </NavLink>

        {/* Hamburger */}
        <div className="block lg:hidden">
          <button
            onClick={toggleMenu}
            className="flex items-center px-3 py-2 border-2 rounded text-gray-200 border-gray-400 hover:text-white hover:border-white"
            aria-label="Toggle navigation"
          >
            <svg
              className="fill-current h-3 w-3"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              {isOpen ? (
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              ) : (
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
              )}
            </svg>
          </button>
        </div>

        {/* Links + Profile */}

        <div
          className={`${
            isOpen ? "block" : "hidden"
          } w-full flex-grow lg:flex lg:items-center lg:w-auto`}
        >
          <div className="text-sm lg:flex-grow lg:flex lg:justify-end lg:space-x-4 mt-4 lg:mt-0">
            {user && (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `font-semibold block mt-4 lg:inline-block lg:mt-0 ${
                      isActive
                        ? activeLinkClassByMenu["dashboard"]
                        : normalLinkClass
                    }`
                  }
                  end
                  onClick={closeMenu}
                >
                  Dashboard 📊
                </NavLink>
                <NavLink
                  to="/inventory"
                  className={({ isActive }) =>
                    `font-semibold block mt-4 lg:inline-block lg:mt-0 ${
                      isActive
                        ? activeLinkClassByMenu["inventory"]
                        : normalLinkClass
                    }`
                  }
                  onClick={closeMenu}
                >
                  Inventory 📦
                </NavLink>
                <NavLink
                  to="/memories"
                  className={({ isActive }) =>
                    `font-semibold block mt-4 lg:inline-block lg:mt-0 ${
                      isActive
                        ? activeLinkClassByMenu["memories"]
                        : normalLinkClass
                    }`
                  }
                  onClick={closeMenu}
                >
                  Memories 📖✨
                </NavLink>

                {/* User Profile + Logout */}

                <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                  {/* Profile Picture or Default Avatar */}
                  <img
                    src={`https://ui-avatars.com/api/?name=${
                      user.displayName || user.email
                    }&background=random`}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  {/* Username */}
                  <span className="text-white text-sm truncate max-w-[120px]">
                    {user.displayName || user.email}
                  </span>
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="font-semibold cursor-pointer bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
            {!user && (
              <NavLink
                to="/"
                className={`block mt-4 lg:inline-block lg:mt-0 ${normalLinkClass}`}
                onClick={closeMenu}
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

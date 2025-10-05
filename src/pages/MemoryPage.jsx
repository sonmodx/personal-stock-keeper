// src/pages/MemoryPage.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useToast } from "../components/ToastProvider";
import AddMemoryModal from "../components/AddMemoryModal";
import EventModal from "../components/EventModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal"; // Import the DeleteConfirmModal
import { format } from "date-fns";
import { auth } from "../firebase/firebaseConfig";
import { useGlobal } from "../context/GlobalContext";
import { MAPPING_BTN_COLORS_CLASSES } from "../utils/constants";

function MemoryPage() {
  const { globalValue } = useGlobal();
  const elementColor = globalValue.memoryColor || "green";

  const colorMap = MAPPING_BTN_COLORS_CLASSES;
  const colorBundelSet = colorMap[elementColor] || colorMap["green"];
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddMemoryModalOpen, setIsAddMemoryModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isConfirmDeleteMemoryModalOpen, setIsConfirmDeleteMemoryModalOpen] =
    useState(false); // New state for confirmation modal
  const [memoryToDelete, setMemoryToDelete] = useState(null); // State to hold memory being deleted
  const [deleteLoading, setDeleteLoading] = useState(false); // State for delete operation loading
  const { showToast } = useToast();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "memories"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const memoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMemories(memoriesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching memories:", error);
        showToast("Failed to load memories.", "error");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [showToast]);

  // Function to open the delete confirmation modal for a memory
  const confirmDeleteMemory = (memory) => {
    setMemoryToDelete(memory);
    setIsConfirmDeleteMemoryModalOpen(true);
  };

  // Function to handle the actual deletion after confirmation
  const executeDeleteMemory = async () => {
    if (!memoryToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteDoc(
        doc(db, "users", auth.currentUser.uid, "memories", memoryToDelete.id)
      );

      showToast("Memory deleted successfully!🗑️", "success");
      setIsConfirmDeleteMemoryModalOpen(false); // Close modal
      setMemoryToDelete(null); // Clear selected memory
    } catch (error) {
      console.error("Error deleting memory:", error);
      showToast(`Error deleting memory: ${error.message}`, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEventModal = (memory) => {
    setSelectedMemory(memory);
    setIsEventModalOpen(true);
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
      // <div className="text-center py-8 text-gray-600">Loading Memories...</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Your Memories 📖
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setIsAddMemoryModalOpen(true)}
          className={`${colorBundelSet} cursor-pointer text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 flex items-center focus:outline-none focus:ring-2  focus:ring-offset-2`}
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
          Add New Memory
        </button>
      </div>

      {memories.length === 0 ? (
        <p className="text-center text-gray-600 text-lg mt-8">
          No memories added yet. Start by adding one!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 flex flex-col justify-between"
            >
              <div
                onClick={() => openEventModal(memory)}
                className="cursor-pointer flex-grow"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {memory.name}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Created:{" "}
                  {memory.createdAt
                    ? format(memory.createdAt.toDate(), "PPP")
                    : "N/A"}
                </p>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {memory.description || "No description provided."}
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDeleteMemory(memory);
                  }} // Use confirmDeleteMemory
                  className="cursor-pointer text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200 flex items-center"
                  aria-label={`Delete ${memory.name}`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddMemoryModal
        isOpen={isAddMemoryModalOpen}
        onClose={() => setIsAddMemoryModalOpen(false)}
        btnColor={elementColor}
      />

      {selectedMemory && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          memory={selectedMemory}
          btnColor={elementColor}
        />
      )}

      {/* Delete Confirmation Modal for Memory */}
      <DeleteConfirmModal
        isOpen={isConfirmDeleteMemoryModalOpen}
        itemName={memoryToDelete?.name || ""}
        onConfirm={executeDeleteMemory}
        onClose={() => {
          setIsConfirmDeleteMemoryModalOpen(false);
          setMemoryToDelete(null); // Clear on close
        }}
        loading={deleteLoading}
      />
    </div>
  );
}

export default MemoryPage;

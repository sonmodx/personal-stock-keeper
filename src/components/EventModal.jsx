// src/components/EventModal.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useToast } from "./ToastProvider";
import DeleteConfirmModal from "./DeleteConfirmModal";
import DatePicker from "react-datepicker";
import { auth } from "../firebase/firebaseConfig";

import { format, isToday, isPast } from "date-fns";
import { MAPPING_BTN_COLORS_CLASSES } from "../utils/constants";

function EventModal({ isOpen, onClose, memory, btnColor = "green" }) {
  const elementColor = btnColor;

  const colorMap = MAPPING_BTN_COLORS_CLASSES;
  const colorBundelSet = colorMap[elementColor] || colorMap["green"];
  const [eventDate, setEventDate] = useState(null);
  const [eventDescription, setEventDescription] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEventItems, setLoadingEventItems] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmDeleteEventModalOpen, setIsConfirmDeleteEventModalOpen] =
    useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen || !memory?.id) return;

    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "memories", memory.id, "events"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate(),
        }));
        setEvents(eventsData);
        setLoadingEventItems(false);
      },
      (error) => {
        console.error("Error fetching events:", error);
        showToast("Failed to load events.", "error");
        setLoadingEventItems(false);
      }
    );

    return () => {
      unsubscribe();
      setEventDate(null);
      setEventDescription("");
      setError("");
      setLoading(false);
      setIsConfirmDeleteEventModalOpen(false);
      setEventToDelete(null);
      setDeleteLoading(false);
    };
  }, [isOpen, memory?.id, showToast]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!eventDate) {
      setError("Event Date is required.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "users",
          auth.currentUser.uid,
          "memories",
          memory.id,
          "events"
        ),
        {
          date: eventDate,
          description: eventDescription.trim(),
          createdAt: serverTimestamp(),
        }
      );
      showToast("Event added successfully! 🎉", "success");
      setEventDate(null);
      setEventDescription("");
    } catch (err) {
      console.error("Error adding event: ", err);
      setError(`Failed to add event: ${err.message}`);
      showToast(`Failed to add event: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteEvent = (event) => {
    setEventToDelete(event);
    setIsConfirmDeleteEventModalOpen(true);
  };

  const executeDeleteEvent = async () => {
    if (!eventToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteDoc(
        doc(
          db,
          "users",
          auth.currentUser.uid,
          "memories",
          memory.id,
          "events",
          eventToDelete.id
        )
      );
      showToast("Event deleted successfully!🗑️", "success");
      setIsConfirmDeleteEventModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast(`Error deleting event: ${error.message}`, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isOpen || !memory) return null;

  // Determine the ID of the last event to highlight it
  // Now, the "last" event in the array will be the OLDEST if sorted desc,
  // but "last date" in the timeline (meaning the latest date added or overall latest)
  // still refers to the most recent one.
  // If "highlight the last date" means highlight the *newest* event in the timeline,
  // then it's the first element of the array when sorted descending.
  // Let's assume "last date" means the most recent/newest date.
  const newestEventId = events.length > 0 ? events[0].id : null; // Changed to events[0] for newest

  return (
    <div className="fixed inset-0 bg-[rgba(17,24,39,0.8)] flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 md:p-8 relative transform scale-100 animate-slide-up-fade opacity-100!">
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-3xl font-bold transition-colors duration-200"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Events for "{memory.name}"
        </h2>
        <p className="text-gray-600 text-center mb-6">{memory.description}</p>

        {error && (
          <p className="text-red-600 bg-red-100 border border-red-300 rounded-md p-3 mb-4 text-center text-sm">
            {error}
          </p>
        )}

        {/* Add New Event Form */}
        <form
          onSubmit={handleAddEvent}
          className="space-y-4 border-b pb-4 mb-4"
        >
          <h3 className="text-lg font-semibold text-gray-700">Add New Event</h3>
          <div>
            <label
              htmlFor="eventDate"
              className="block text-sm font-medium text-gray-700"
            >
              Event Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={eventDate}
              onChange={(date) => setEventDate(date)}
              dateFormat="dd-MMMM-yyyy"
              placeholderText="Select event date"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={15}
              showMonthDropdown
              scrollableMonthDropdown
            />
          </div>
          <div>
            <label
              htmlFor="eventDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Description (Optional)
            </label>
            <textarea
              id="eventDescription"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows="2"
              placeholder="e.g., Rode Space Mountain"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            ></textarea>
          </div>
          <button
            type="submit"
            className={`${colorBundelSet} cursor-pointer w-full py-2 px-4 text-white font-semibold rounded-md focus:outline-none focus:ring-2  focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
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
              "Add Event"
            )}
          </button>
        </form>

        {/* Events Timeline */}
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Timeline of Events
        </h3>
        {loadingEventItems || loading ? (
          <p className="text-center text-gray-500 mt-4">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-600 mt-4">
            No events recorded for this memory yet.
          </p>
        ) : (
          <div className="space-y-4 py-2 max-h-60 overflow-y-auto pr-2">
            {events.map((event) => {
              const eventDateObj = event.date;
              const isValidDate =
                eventDateObj instanceof Date && !isNaN(eventDateObj);
              const isEventToday = isValidDate ? isToday(eventDateObj) : false;
              const isEventPast = isValidDate ? isPast(eventDateObj) : false;
              const formattedDate = isValidDate
                ? format(eventDateObj, "dd-MMMM-yyyy")
                : "Invalid Date";

              let highlightClass = isEventToday
                ? "bg-yellow-100 border-yellow-400"
                : isEventPast
                ? "bg-gray-50 border-gray-300 text-gray-500"
                : "bg-blue-50 border-blue-300";

              // Check if the current event is the newest one (first in the descending sorted list)
              const isNewestEvent = event.id === newestEventId;
              if (isNewestEvent) {
                // Add a distinct highlight for the newest event
                highlightClass = "bg-green-100 border-green-500 "; // Example highlight
              }

              return (
                <div
                  key={event.id}
                  className={`border-l-4 p-3 rounded-md shadow-sm relative ${highlightClass}`}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold">
                      {formattedDate}
                      {isEventToday && (
                        <span className="ml-2 text-xs font-bold text-yellow-700">
                          (Today!)
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => confirmDeleteEvent(event)}
                      className="cursor-pointer text-red-500 hover:text-red-700 text-sm font-semibold"
                      aria-label={`Delete event on ${formattedDate}`}
                    >
                      Delete
                    </button>
                  </div>
                  {event.description && (
                    <p className="text-gray-700 text-sm mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={isConfirmDeleteEventModalOpen}
        itemName={
          eventToDelete?.description ||
          (eventToDelete?.date
            ? format(eventToDelete.date, "dd-MMMM-yyyy")
            : "this event")
        }
        onConfirm={executeDeleteEvent}
        onClose={() => {
          setIsConfirmDeleteEventModalOpen(false);
          setEventToDelete(null);
        }}
        loading={deleteLoading}
      />
    </div>
  );
}

export default EventModal;

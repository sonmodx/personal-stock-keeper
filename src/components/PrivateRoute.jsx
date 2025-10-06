import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
    return unsubscribe;
  }, []);

  if (user === undefined)
    return (
      // Verifying user...
      // Todo: Add a loading animation here for better UX when loading user state
      // approach1: Full loading screen with backdrop
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]">
        <dotlottie-wc
          src="https://lottie.host/b33e9fc3-d89e-4d41-b9e4-3a57ef3cd717/Hn48ziTxSw.lottie"
          style={{ width: "180px", height: "180px" }}
          autoplay
          loop
        ></dotlottie-wc>
        <p className="text-white mt-4 text-lg font-medium animate-pulse">
          Loading ...
        </p>
      </div>
    );

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

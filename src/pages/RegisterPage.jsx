import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { AiOutlineUser, AiOutlineMail, AiOutlineLock } from "react-icons/ai";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // Validation errors
  const [loading, setLoading] = useState(false); // <-- added

  const navigate = useNavigate();

  // Validation helpers
  const validateName = (value) => {
    if (!value.trim()) return "Name is required";
    return "";
  };

  const validateEmail = (value) => {
    if (!value) return "Email is required";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? "" : "Invalid email format";
  };

  const passwordRules = [
    { test: (v) => v.length >= 6, message: "At least 6 characters long" },
    { test: (v) => /[A-Z]/.test(v), message: "At least one uppercase letter" },
    { test: (v) => /[0-9]/.test(v), message: "At least one number" },
  ];

  const validatePassword = (value) => {
    return passwordRules
      .filter((rule) => !rule.test(value))
      .map((rule) => rule.message);
  };

  // Run validation on load + whenever values change
  useEffect(() => {
    setFieldErrors({
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    });
  }, [name, email, password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Stop if errors exist
    if (
      fieldErrors.name ||
      fieldErrors.email ||
      (Array.isArray(fieldErrors.password) && fieldErrors.password.length > 0)
    ) {
      return;
    }

    setLoading(true); // start loading
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, { displayName: name });

      navigate("/");
    } catch (err) {
      setError(err.message);
      setLoading(false); // stop loading if error
    }
  };

  return (
    <div className="flex items-center justify-center mt-8">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-xl w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create Account ✨
        </h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Display Name */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Display Name
        </label>
        <div className="relative mb-1">
          <AiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Enter your name"
            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:outline-none ${
              fieldErrors.name
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-yellow-400"
            }`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {fieldErrors.name && (
          <p className="text-red-500 text-xs mb-3">{fieldErrors.name}</p>
        )}

        {/* Email */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="relative mb-1">
          <AiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="email"
            placeholder="Enter your email"
            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:outline-none ${
              fieldErrors.email
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-yellow-400"
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {fieldErrors.email && (
          <p className="text-red-500 text-xs mb-3">{fieldErrors.email}</p>
        )}

        {/* Password */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative mb-1">
          <AiOutlineLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="password"
            placeholder="Enter your password"
            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:outline-none ${
              fieldErrors.password?.length > 0
                ? "border-red-500 focus:ring-red-400"
                : "focus:ring-yellow-400"
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Password Rules as Bullet List */}
        {fieldErrors.password && Array.isArray(fieldErrors.password) && (
          <ul className="text-xs text-red-500 list-disc pl-6 mb-3">
            {fieldErrors.password.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        )}

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className={`cursor-pointer w-full flex items-center justify-center gap-2 
            ${
              loading
                ? "bg-yellow-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            } 
            text-white font-semibold p-3 rounded-lg transition duration-200`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
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
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Creating account...
            </>
          ) : (
            "Register"
          )}
        </button>

        {/* Login Link */}
        <p className="text-sm mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-yellow-600 font-medium hover:underline"
          >
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;

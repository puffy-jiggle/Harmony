import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserVoice from "../features/UserVoice";
import Navigation from "../core/Navigation";

/**
 * App Component - Main landing page of the Harmony application
 * 
 * This component demonstrates the integration of:
 * - TailwindCSS for utility-first styling
 * - DaisyUI for pre-built components and themes
 * - React Router for navigation
 * 
 * Styling Notes:
 * - Uses Tailwind's flexbox and spacing utilities
 * - Implements DaisyUI's button and card components
 * - Responsive by default through Tailwind classes
 */
const App: React.FC = () => {
    //State to store the logged-in username
    const [username, setUsername] = useState<string | null>(null);

    //Simulate checking the user's login status
    useEffect(()=> {
      const user = localStorage.getItem("username")
  
      if (user) {
        setUsername(user);
      }
    },[])
  return (
    <div className="bg-base-200 min-h-screen flex flex-col">
      {/* Navigation bar */}
      <Navigation />

      {/* Main content container with centered content */}
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          {/* Main heading with Tailwind's typography and spacing classes */}
          <h1 className="text-4xl font-bold text-primary mb-4">Create Your Harmony</h1>
          {username ? (
          <p className="text-lg text-green-700 mb-4">Hi, {username}!</p>
        ) : (
          <p className="text-lg text-red-600 mb-4">You are not logged in. <Link to="/login" className="text-blue-500 hover:underline">
          Login
        </Link></p>
        )}
          {/* Main recording interface */}
          <UserVoice />

          {/* Sample navigation button */}
          <div className="mt-4">
            <Link to="/test" className="btn btn-secondary">
              Try Test Component
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

/**
 * Usage Notes:
 * - This component is rendered at both '/' and '/app' routes
 * - Demonstrates basic DaisyUI components: buttons and cards
 * - Shows how to combine Tailwind utilities with DaisyUI components
 * 
 * Development Tips:
 * - Add new routes in index.tsx
 * - Tailwind classes can be customized in tailwind.config.js
 * - DaisyUI theme can be modified in the same config file
 */